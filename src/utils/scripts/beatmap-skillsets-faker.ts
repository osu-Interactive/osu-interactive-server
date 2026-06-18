import { parseExtraConditions } from '@/utils/scripts/helpers/extra-conditions-parser'
import type { BeatmapsModel } from '@/models/beatmaps.model'
import type { BeatmapSkillsets } from '@/types/osu.types'

export async function fakeSkillsets(
    model: BeatmapsModel,
    amount: number,
    startId: number,
    extraConditions: string | null = null,
) {
    const parsedExtraCondition = extraConditions ? parseExtraConditions(extraConditions) : null

    const beatmaps = await model.getBeatmaps(amount, startId, parsedExtraCondition)

    for (const beatmap of beatmaps) {
        await model.setBeatmapSkillsets(beatmap.id, getFakeSkillsets())
        console.log(`Faked skillsets for beatmap ${beatmap.id}`)
    }
}

function getFakeSkillsets(): BeatmapSkillsets {
    return {
        jumps: randomInt(0, 100),
        streams: randomInt(0, 100),
        fingerControl: randomInt(0, 100),
        tech: randomInt(0, 100),
        alt: randomInt(0, 100),
        gimmick: randomInt(0, 100),
    }
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
