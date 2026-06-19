import { getMapset } from '@/services/beatmaps.service'
import { BeatmapsModel } from '@/models/beatmaps.model'

class MapsetsCollector {
    public async startFetching(
        mapsetModel: BeatmapsModel,
        amountToFetch: number,
        startId: number,
    ): Promise<void> {
        let fetchedCount = 0
        console.log(`Fetched: ${fetchedCount} of ${amountToFetch}`)
        while (fetchedCount < amountToFetch) {
            await this.fetchBeatmapset(mapsetModel, startId)

            fetchedCount++
            startId++
        }

        console.log(`✅ Fetched ${fetchedCount} beatmapsets, fetching complete.`)
    }

    private async fetchBeatmapset(mapsetModel: BeatmapsModel, id: number): Promise<void> {
        const res = await getMapset(mapsetModel, id, { raw: true })

        console.log(
            '🎵 Beatmapset fetched:',
            id,
            res ? [res.title, res.artist, res.creator, res.status].join(' | ') : res,
        )
    }
}

export default new MapsetsCollector()
