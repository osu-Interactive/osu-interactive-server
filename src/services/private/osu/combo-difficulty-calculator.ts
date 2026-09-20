import RosuBeatmapWrapper from '@/services/private/osu/rosu-beatmap-wrapper'
import { BeatmapDecoder } from 'osu-parsers'
import { StandardRuleset } from 'osu-standard-stable'

type BeatmapObjects = ReturnType<StandardRuleset['applyToBeatmap']>['hitObjects']

const comboDifficultyCalculator = () => ({
    async getBMComboPP(beatmapId: number) {
        const beatmap = await RosuBeatmapWrapper.create(beatmapId)
        const calculatedBeatmap = beatmap.calculate({ mods: 'CL' })

        console.log(RosuBeatmapWrapper.map(calculatedBeatmap))
        const structure = await RosuBeatmapWrapper.getBeatmapStructure(beatmapId)

        const ranges = await this.getObjectsComboRanges(structure, 100)
        console.log(ranges)
        const ppRanges: number[] = []
        for (const range of ranges) {
            const objects = this.getRawObjectsFromBeatmap(structure, range)
            const beatmapPart = this.replaceTimingPoints(structure, objects)
            const rosuBeatmap = RosuBeatmapWrapper.createWithStructure(beatmapPart)
            const pp = rosuBeatmap.calculate({ mods: 'CL' }).pp
            const ppRounded = Math.round(pp * 100) / 100
            ppRanges.push(ppRounded)
        }

        console.log(this.estimatePP(600, ppRanges))
    },

    estimatePP(combo: number, pp: number[]) {
        //TODO: Implement
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
