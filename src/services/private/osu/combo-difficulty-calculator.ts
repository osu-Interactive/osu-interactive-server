import RosuBeatmapWrapper, { type RosuBeatmap } from '@/services/private/osu/rosu-beatmap-wrapper'
import { BeatmapDecoder } from 'osu-parsers'
import { StandardRuleset } from 'osu-standard-stable'
import questCategories from '@/config/seeds/quests-categories-seed'

type QuestCategoryName = (typeof questCategories)[number]['name']

type BeatmapObjects = ReturnType<StandardRuleset['applyToBeatmap']>['hitObjects']

const comboDifficultyCalculator = () => ({
    async getBMComboPP(beatmapId: number, questCategory: QuestCategoryName) {
        const structure = await RosuBeatmapWrapper.getBeatmapStructure(beatmapId)
        const beatmapRosu = RosuBeatmapWrapper.createWithStructure(structure).calculate({
            mods: 'CL',
        }).difficulty

        const questCategoryAverageDoablePP = this.getQuestCategoryAverageDoablePP(questCategory)
        console.log(`Estimated PP for category ${questCategory}:`, questCategoryAverageDoablePP)

        const totalObjects =
            (beatmapRosu.nCircles ?? 0) + (beatmapRosu.nSliders ?? 0) + (beatmapRosu.nSpinners ?? 0)

        let combo = 300
        let comboDifficulty = this.getComboPP(structure, combo, totalObjects)
        let comboPass = this.isComboDifficultyValid(comboDifficulty, questCategoryAverageDoablePP)

        while (!comboPass.valid && comboDifficulty > 0) {
            console.log(comboDifficulty, 'pp for', combo, 'combo')
            if (comboPass.direction === 'higher') {
                combo = combo + 10 * (comboPass.percentage)
            } else {
                combo = combo - 10 * (comboPass.percentage)
            }

            comboDifficulty = this.getComboPP(structure, combo, totalObjects)


            comboPass = this.isComboDifficultyValid(comboDifficulty, questCategoryAverageDoablePP)
        }
        console.log(combo, 'combo corresponds to', comboDifficulty, 'pp')
        // console.log(estimatedPP)
        // console.log(questCategoryAverageDoablePP)
        // console.log(this.isComboDifficultyValid(estimatedPP, questCategoryAverageDoablePP))
    },

    getComboPP(structure: string, combo: number, totalObjects: number) {
        const ppRanges: [number, number][] = []
        const ranges = this.getObjectsComboRangesSlided(structure, combo, totalObjects)

        for (const range of ranges) {
            const objects = this.getRawObjectsFromBeatmap(structure, range)
            const beatmapPart = this.replaceTimingPoints(structure, objects)
            const rosuBeatmap = RosuBeatmapWrapper.createWithStructure(beatmapPart)
            const ppTop = rosuBeatmap.calculate({ mods: 'CL', accuracy: 100 }).pp
            const ppBottom = rosuBeatmap.calculate({ mods: 'CL', accuracy: 90 }).pp
            const ppRounded: [number, number] = [this.round(ppTop), this.round(ppBottom)]

            ppRanges.push(ppRounded)
        }

        //console.log(`${this.estimatePP(ppRanges)} pp for ${combo} combo`)
        return this.estimatePP(ppRanges)
    },

    getObjectsComboRangesSlided(structure: string, comboRange: number, maxCombo: number) {
        const ruleset = new StandardRuleset()
        const decoder = new BeatmapDecoder()
        const parsed = decoder.decodeFromString(structure)
        const beatmap = ruleset.applyToBeatmap(parsed).hitObjects

        let slideStep = 10

        let combo = 0
        let ranges: [number, number][] = []
        let objects = 0

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

    getSection(
        beatmap: BeatmapObjects,
        sectionLengthCombo: number,
        startWith: number,
    ): [number, number] {
        //console.log(sectionLengthCombo, 'Длина отрезка')
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

    isComboDifficultyValid(ppForCategory: number, ppForQuest: number) {
        const difference = ppForQuest - ppForCategory;
        const percentage = Math.abs(difference / ppForCategory) * 100;

        if (Math.abs(difference) <= ppForCategory * 0.01) {
            return {
                valid: true,
                direction: null,
                percentage: 0,
            }
        }

        return {
            valid: false,
            direction: difference > 0 ? 'higher' : 'lower',
            percentage
        };
    },

    getQuestCategoryAverageDoablePP(questCategory: QuestCategoryName) {
        const category = questCategories.find((category) => category.name === questCategory)
        if (!category) throw new Error('Category not found')
        if (category.maxPP === null) {
        }
        return this.average(category.minPP / 20, (category.maxPP ?? 20000) / 20)
    },

    estimatePP(pp: [number, number][]) {
        const averagePP: number[] = []

        for (const range of pp) {
            averagePP.push(this.round(this.average(range[0], range[1])))
        }

        return Math.min(...averagePP)
    },

    average(a: number, b: number) {
        return (a + b) / 2
    },

    round(number: number) {
        return Math.round(number * 100) / 100
    },

    addRange(ranges: [number, number][], objects: number) {
        if (ranges.length === 0) {
            ranges.push([0, objects])
        } else {
            const previous = ranges.at(-1)
            ranges.push([previous![1], objects])
        }
    },

    getObjectCombo(object: BeatmapObjects[number]) {
        if (object.constructor.name !== 'Slider') {
            return 1
        } else {
            return object.nestedHitObjects.length
        }
    },

    getRawObjectsFromBeatmap(beatmap: string, range: [number, number] | null = null) {
        const hitObjects = beatmap
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

    replaceTimingPoints(beatmap: string, hitObjects: string[]) {
        return beatmap.replace(
            /(\[HitObjects]\r?\n)([\s\S]*?)(?=\r?\n\[|$)/,
            (_, header) => `${header}${hitObjects.join('\r\n')}\r\n`,
        )
    },
})

export default comboDifficultyCalculator
