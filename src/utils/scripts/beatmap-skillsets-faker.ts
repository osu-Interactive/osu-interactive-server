import { parseExtraConditions } from '@/utils/scripts/helpers/extra-conditions-parser'
import { randomInt, clamp } from '@/utils/math'
import type { BeatmapsModel } from '@/models/beatmaps.model'
import type { BeatmapSkillsets } from '@/types/osu.types'

const SKILLSET_CODES = [
    'jumps',
    'streams',
    'fingerControl',
    'tech',
    'alternate',
    'gimmick',
] as const satisfies (keyof BeatmapSkillsets)[]

export async function fakeSkillsets(
    model: BeatmapsModel,
    amount: number,
    startId: number,
    extraConditions: string | null = null,
) {
    const parsedExtraCondition = extraConditions ? parseExtraConditions(extraConditions) : null

    const beatmaps = await model.getBeatmaps(amount, startId, parsedExtraCondition)

    for (const beatmap of beatmaps) {
        await model.setBeatmapSkillsets(beatmap.id, getFakeSkillsets(beatmap.stars))
        console.log(`Faked skillsets for beatmap ${beatmap.id}`)
    }
}

function getFakeSkillsets(stars: number): BeatmapSkillsets {
    const maxValue = getMaxSkillsetValue(stars)
    const dominantSkillset = randomElement(SKILLSET_CODES)
    const skillsets = {} as BeatmapSkillsets

    for (const skillset of SKILLSET_CODES) {
        skillsets[skillset] =
            skillset === dominantSkillset ? maxValue : randomInt(0, Math.max(maxValue - 1, 0))
    }

    return skillsets
}

function getMaxSkillsetValue(stars: number) {
    if (stars <= 1) {
        return randomInt(1, 10)
    }

    const base = Math.round(stars * 10)
    const min = base - 15
    const max = base + 15

    return randomInt(clamp(min, 1, 100), clamp(max, 1, 100))
}

function randomElement<T>(items: readonly T[]) {
    return items[randomInt(0, items.length - 1)]
}
