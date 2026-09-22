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

        const totalObjects =
            (beatmapRosu.nCircles ?? 0) + (beatmapRosu.nSliders ?? 0) + (beatmapRosu.nSpinners ?? 0)

        const ranges = this.getObjectsComboRangesSlided(structure, 100, totalObjects)

        const ppRanges: [number, number][] = []
        for (const range of ranges) {
            const objects = this.getRawObjectsFromBeatmap(structure, range)
            const beatmapPart = this.replaceTimingPoints(structure, objects)
            const rosuBeatmap = RosuBeatmapWrapper.createWithStructure(beatmapPart)
            const ppTop = rosuBeatmap.calculate({ mods: 'CL', accuracy: 100 }).pp
            const ppBottom = rosuBeatmap.calculate({ mods: 'CL', accuracy: 90 }).pp
            const ppRounded: [number, number] = [this.round(ppTop), this.round(ppBottom)]

            ppRanges.push(ppRounded)
        }
        const estimatedPP = this.estimatePP(ppRanges)
        console.log(estimatedPP)
        console.log(this.getQuestCategoryAverageDoablePP(questCategory))
    },

    getObjectsComboRangesSlided(structure: string, comboRange: number, maxCombo: number) {
        const ruleset = new StandardRuleset()
        const decoder = new BeatmapDecoder()
        const parsed = decoder.decodeFromString(structure)
        const beatmap = ruleset.applyToBeatmap(parsed).hitObjects

        let baseRange = comboRange
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
                const section = this.getSection(beatmap, baseRange, objects > 1 ? objects : 0)
                console.log(section)
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
        sectionLength: number,
        startWith: number,
    ): [number, number] {
        let combo = 0
        let objects = 0

        let i = startWith

        while (beatmap[i] !== undefined && combo < sectionLength) {
            const object = beatmap[i]
            i++

            objects++
            combo += this.getObjectCombo(object)

            if (i - startWith > sectionLength) {
                throw new Error('Section length is greater than beatmap length')
            }
        }
        return [startWith, objects + startWith]
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

    async getObjectsComboRanges(structure: string, comboRange: number) {
        const ruleset = new StandardRuleset()
        const decoder = new BeatmapDecoder()
        const parsed = decoder.decodeFromString(structure)
        const beatmap = ruleset.applyToBeatmap(parsed).hitObjects

        let combo = 0
        let objects = 0
        let ranges: [number, number][] = []
        let lastCombo = 0

        for (const object of beatmap) {
            lastCombo = combo
            objects++

            combo += this.getObjectCombo(object)

            let nextCombo = comboRange * (ranges.length + 1)

            if (combo === nextCombo || (lastCombo < nextCombo && combo > nextCombo)) {
                this.addRange(ranges, objects)
                // Сохраняем последний отрезок комбо карты даже если он меньше необходимого
            } else if (combo < nextCombo && objects === beatmap.length) {
                this.addRange(ranges, objects)
            }
        }

        return ranges
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
