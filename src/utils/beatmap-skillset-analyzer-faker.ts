import RosuBeatmapWrapper from '@/modules/beatmaps/rosu-beatmap-wrapper'
import { clamp, randomInt } from '@/utils/math'
import type { BeatmapSkillsets } from '@/modules/beatmaps/beatmaps.types'

const SKILLSET_CODES = [
    'jumps',
    'streams',
    'fingerControl',
    'tech',
    'alternate',
    'gimmick',
] as const satisfies (keyof BeatmapSkillsets)[]

class BeatmapSkillsetAnalyzerFaker {
    public async getSkillsets(beatmapId: number) {
        const beatmapStructure = await RosuBeatmapWrapper.getBeatmapStructure(beatmapId)
        const beatmap = RosuBeatmapWrapper.createWithStructure(beatmapStructure)
        const calculatedBeatmap = beatmap.calculate()
        const fakedSkillsets = this.getFakeSkillsets(calculatedBeatmap.difficulty.stars)

        return {
            skillsets: fakedSkillsets,
            beatmapStructure: beatmapStructure,
        }
    }

    private getFakeSkillsets(stars: number): BeatmapSkillsets {
        const maxValue = this.getMaxSkillsetValue(stars)
        const dominantSkillset = this.randomElement(SKILLSET_CODES)
        const skillsets = {} as BeatmapSkillsets

        for (const skillset of SKILLSET_CODES) {
            skillsets[skillset] =
                skillset === dominantSkillset ? maxValue : randomInt(0, Math.max(maxValue - 1, 0))
        }

        return skillsets
    }

    private getMaxSkillsetValue(stars: number) {
        if (stars <= 1) {
            return randomInt(1, 10)
        }

        const base = Math.round(stars * 10)
        const min = base - 15
        const max = base + 15

        return randomInt(clamp(min, 1, 100), clamp(max, 1, 100))
    }

    private randomElement<T>(items: readonly T[]) {
        return items[randomInt(0, items.length - 1)]
    }
}

export default BeatmapSkillsetAnalyzerFaker
