import { BeatmapDecoder } from 'osu-parsers'
import { StandardRuleset } from 'osu-standard-stable'
import { round, average } from '@/utils/math'
import RosuBeatmapWrapper from '@/services/private/osu/rosu-beatmap-wrapper'
import { AppError } from '@/errors/app-error'

import type { Category } from '@/config/seeds/quests-categories-seed'

type BeatmapObjects = ReturnType<StandardRuleset['applyToBeatmap']>['hitObjects']

const log = false

const comboDifficultyCalculator = () => ({
    async getBMComboPP(beatmapId: number, questCategory: Category) {
        const categoryPP = this.getQuestCategoryAveragePP(questCategory)
        const structure = await RosuBeatmapWrapper.getBeatmapStructure(beatmapId)

        // TODO: Optimize the quest generation system by pre-calculating PP for the condition below.
        //       Currently, it iterates over beatmaps and throws an error when the PP is too low,
        //       then tries another beatmap. This could be significantly optimized and made more
        //       API-friendly, reducing unnecessary requests to the osu! API.
        if (!this.isMaxPPEnough(structure, categoryPP)) {
            throw new AppError(`Beatmap max pp is lower than ${categoryPP}`, {
                code: 'BEATMAP_PP_TOO_LOW',
            })
        }

        const beatmapRosu = RosuBeatmapWrapper.createWithStructure(structure).calculate({
            mods: 'CL',
        }).difficulty

        log && console.log(`Estimated PP for category ${questCategory.code}:`, categoryPP)

        const totalObjects =
            (beatmapRosu.nCircles ?? 0) + (beatmapRosu.nSliders ?? 0) + (beatmapRosu.nSpinners ?? 0)

        const { combo, comboDifficulty } = this.findClosestComboForPP(
            structure,
            categoryPP,
            totalObjects,
            beatmapRosu.maxCombo,
        )

        log && console.log(combo, 'combo corresponds to', comboDifficulty, 'pp')
        return combo
    },

    /**
     * Finds the combo required to reach the target PP on the beatmap.
     * Uses binary search, starting from the middle of the maximum combo,
     * and adjusts the target combo depending on whether the estimated PP
     * is too high or too low.
     */
    findClosestComboForPP(
        structure: string,
        targetPP: number,
        totalObjects: number,
        maxCombo: number,
    ) {
        let left = 1
        let right = Math.max(1, Math.floor(maxCombo))
        let bestCombo = left
        let bestComboDifficulty = 0
        let bestDifference = Math.abs(targetPP - bestComboDifficulty)

        while (left <= right) {
            const combo = Math.floor((left + right) / 2)
            const comboDifficulty = this.getComboPP(structure, combo, totalObjects)
            const difference = Math.abs(targetPP - comboDifficulty)
            const comboPass = this.isPPWithinAllowedDeviation(comboDifficulty, targetPP)

            log && console.log(comboDifficulty, 'pp for', combo, 'combo')

            if (difference < bestDifference) {
                bestCombo = combo
                bestComboDifficulty = comboDifficulty
                bestDifference = difference
            }

            if (comboPass.valid) {
                return { combo, comboDifficulty }
            }

            if (comboPass.direction === 'higher') {
                left = combo + 1
            } else {
                right = combo - 1
            }
        }

        return { combo: bestCombo, comboDifficulty: bestComboDifficulty }
    },

    /**
     * Calculates the estimated PP for the required combo across the entire beatmap.
     */
    getComboPP(structure: string, combo: number, totalObjects: number) {
        const ranges = this.getObjectsComboRangesSlided(structure, combo, totalObjects)
        const averagePP: number[] = []

        for (const range of ranges) {
            averagePP.push(this.getPPForBeatmapRange(structure, range))
        }

        return this.estimatePPForSections(averagePP)
    },

    /**
     * Gets sliding beatmap sections for the requested combo range.
     *
     * For example, with a combo range of 300, the sections will be
     * 0-300, 10-310, 20-320, etc.
     *
     * The sliding step is defined by `slideStep`.
     */
    getObjectsComboRangesSlided(structure: string, comboRange: number, maxCombo: number) {
        const slideStep = 10

        const ruleset = new StandardRuleset()
        const decoder = new BeatmapDecoder()
        const parsed = decoder.decodeFromString(structure)
        const beatmap = ruleset.applyToBeatmap(parsed).hitObjects

        let combo = 0
        let objects = 0
        let ranges: [number, number][] = []

        let sectionCounter = 0
        for (const object of beatmap) {
            objects++

            combo += this.getObjectCombo(object)
            const neededCombo = objects > 1 ? slideStep * sectionCounter : 0
            if (combo >= neededCombo) {
                const section = this.getSection(beatmap, comboRange, objects > 1 ? objects : 0)
                if (section[1] === maxCombo) {
                    break
                }

                ranges.push(section)
                sectionCounter++
            }
        }
        return ranges
    },

    /**
     * Gets the object range corresponding to the requested combo range.
     */
    getSection(
        beatmap: BeatmapObjects,
        sectionLengthCombo: number,
        startWith: number,
    ): [number, number] {
        let combo = 0
        let objects = 0

        let i = startWith

        while (beatmap[i] !== undefined && combo < sectionLengthCombo) {
            const object = beatmap[i]
            i++

            objects++
            combo += this.getObjectCombo(object)

            if (i - startWith > sectionLengthCombo) {
                throw new Error('Section length is greater than beatmap length')
            }
        }
        return [startWith, objects + startWith]
    },

    /**
     * Calculates PP for a specific part of a beatmap based on an object range.
     * To account for accuracy, it simply takes the average between 90% and 100%.
     * The right thing to do later would be to improve how accuracy is accounted for.
     */
    getPPForBeatmapRange(structure: string, range: [number, number] | null) {
        const objects = this.getBeatmapStructureHitObjects(structure, range)
        const beatmapPart = this.replaceBeatmapStructureHitObjects(structure, objects)
        const rosuBeatmap = RosuBeatmapWrapper.createWithStructure(beatmapPart)
        const ppTop = round(rosuBeatmap.calculate({ mods: 'CL', accuracy: 100 }).pp)
        const ppBottom = round(rosuBeatmap.calculate({ mods: 'CL', accuracy: 90 }).pp)
        return round(average(ppBottom, ppTop))
    },

    /**
     * Estimates the PP value of the beatmap sections based on their minimum PP.
     *
     * Also takes into account other sections whose PP is within 10% of the minimum.
     * For each such section, the estimated PP is reduced by `reducePerNearPP` percent.
     *
     * The maximum reduction is limited by `minPPReductionPercent`.
     */
    estimatePPForSections(pp: number[]) {
        const minPPReductionPercent = 10
        const reducePerNearPP = 0.5

        const minPP = Math.min(...pp)
        const nearMinPP = pp.filter((pp) => pp >= minPP * 0.9 && pp <= minPP * 1.1)

        const reductionPercent = round(
            Math.min(nearMinPP.length * reducePerNearPP, minPPReductionPercent),
        )

        return round(minPP * (1 - reductionPercent / 100))
    },

    /**
     * Checks whether the PP estimated for the requested combo is close enough
     * to the amount of PP the player is expected to achieve for the selected quest category.
     *
     * The maximum allowed deviation is defined by `allowedDeviationFactor`.
     */
    isPPWithinAllowedDeviation(ppForCategory: number, targetPP: number) {
        const allowedDeviationFactor = 0.1 // 10%
        const difference = targetPP - ppForCategory

        if (Math.abs(difference) <= ppForCategory * allowedDeviationFactor) {
            return {
                valid: true,
                direction: null,
            }
        }

        return {
            valid: false,
            direction: difference > 0 ? 'higher' : 'lower',
        }
    },

    /**
     * Calculates the approximate amount of PP the player is expected to achieve
     * on average for the selected quest category.
     *
     * Takes the average of the category's PP range and divides it by 20.
     * This represents the approximate PP value of the player's top scores
     * required to reach the target amount of PP.
     *
     * For example, if the player's top scores average around 300 PP,
     * the player would have approximately 6,000 total PP.
     */
    getQuestCategoryAveragePP(questCategory: Category) {
        if (questCategory.maxPP === null) {
            //TODO: Decide what to do with highest quests category
        }
        return average(questCategory.minPP / 20, (questCategory.maxPP ?? 20000) / 20)
    },

    /**
     * Checks whether the beatmap's maximum combo PP, accounting for accuracy,
     * is enough for the category's double PP requirement.
     */
    isMaxPPEnough(structure: string, categoryPP: number) {
        const maxPP = this.getPPForBeatmapRange(structure, null)
        const deviation = this.isPPWithinAllowedDeviation(maxPP, categoryPP)

        return deviation.valid || deviation.direction === 'lower'
    },

    /**
     * Calculates how much combo an object is worth.
     *
     * Non-slider objects are worth 1 combo.
     * For sliders, counts the slider head, tail, and slider ticks.
     */
    getObjectCombo(object: BeatmapObjects[number]) {
        if (object.constructor.name !== 'Slider') {
            return 1
        } else {
            return object.nestedHitObjects.length
        }
    },

    /**
     * Extracts the [HitObjects] section from the beatmap structure.
     */
    getBeatmapStructureHitObjects(beatmapStructure: string, range: [number, number] | null = null) {
        const hitObjects = beatmapStructure
            .match(/\[HitObjects]\r?\n([\s\S]*)/)?.[1]
            ?.trim()
            .split(/\r?\n/)

        if (!Array.isArray(hitObjects) || hitObjects.length < 1) {
            throw new Error('Failed to parse timing points')
        }

        if (range !== null) {
            return hitObjects.slice(range[0], range[1])
        } else {
            return hitObjects
        }
    },

    /**
     * Replaces the [HitObjects] section in the beatmap structure
     * with the provided hit objects.
     */
    replaceBeatmapStructureHitObjects(beatmapStructure: string, hitObjects: string[]) {
        return beatmapStructure.replace(
            /(\[HitObjects]\r?\n)([\s\S]*?)(?=\r?\n\[|$)/,
            (_, header) => `${header}${hitObjects.join('\r\n')}\r\n`,
        )
    },
})

export default comboDifficultyCalculator
