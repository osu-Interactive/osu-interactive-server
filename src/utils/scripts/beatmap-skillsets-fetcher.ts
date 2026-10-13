import axios from 'axios'
import { parseExtraConditions } from '@/utils/scripts/helpers/extra-conditions-parser'
import type BeatmapsRepository from '@/modules/beatmaps/beatmaps.repository'

export async function skillsetsFetcher(
    beatmapsRepository: BeatmapsRepository,
    amount: number,
    startId: number,
    extraConditions: string | null = null,
) {
    const parsedExtraCondition = extraConditions ? parseExtraConditions(extraConditions) : null

    const beatmaps = await beatmapsRepository.getBeatmaps(amount, startId, parsedExtraCondition)

    for (const beatmap of beatmaps) {
        const res = await axios.post('http://localhost:3000/skillsets', { beatmapId: beatmap.id })
        console.log(res.data)
        console.log(`Fetched skillsets for beatmap ${beatmap.id}`)
    }
}
