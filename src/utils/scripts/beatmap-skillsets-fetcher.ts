import axios from 'axios'
import { z } from 'zod'
import { parseExtraConditions } from '@/utils/scripts/helpers/extra-conditions-parser'
import type BeatmapsRepository from '@/modules/beatmaps/beatmaps.repository'
import type BeatmapsService from '@/modules/beatmaps/beatmaps.service'
import { codes } from '@/config/seeds/skillsets-seed'
import { env } from '@/config/env'

export const skillsetsResponseSchema = z.object({
    skillsets: z.record(z.enum(codes), z.number().min(0).max(100)),
    beatmapStructure: z.string(),
})

export async function skillsetsFetcher(
    beatmapsService: BeatmapsService,
    beatmapsRepository: BeatmapsRepository,
    amount: number,
    startId: number,
    extraConditions: string | null = null,
) {
    const parsedExtraCondition = extraConditions ? parseExtraConditions(extraConditions) : null

    const beatmaps = await beatmapsRepository.getBeatmaps(amount, startId, parsedExtraCondition)

    for (const beatmap of beatmaps) {
        const res = await axios.post<unknown>(env.SKILLSETS_ANALYZER_URL, {
            beatmapId: beatmap.id,
        })

        const { skillsets, beatmapStructure } = skillsetsResponseSchema.parse(res.data)
        const pp = beatmapsService.getMaxPPForBeatmapAccountedAccuracy(beatmapStructure)
        await beatmapsRepository.setBeatmapSkillsets(beatmap.id, skillsets, pp)
        console.log(`Fetched skillsets for beatmap ${beatmap.id}`)
    }
}
