import BeatmapsService from '@/modules/beatmaps/beatmaps.service'
import { BeatmapsRepository } from '@/modules/beatmaps/beatmaps.repository'

class MapsetsCollector {
    private beatmapsService: BeatmapsService

    constructor(beatmapsModel: BeatmapsRepository) {
        this.beatmapsService = new BeatmapsService(beatmapsModel)
    }

    public async startFetching(
        mapsetModel: BeatmapsRepository,
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

    private async fetchBeatmapset(mapsetModel: BeatmapsRepository, id: number): Promise<void> {
        const res = await this.beatmapsService.getMapset(id, { raw: true })

        console.log(
            '🎵 Beatmapset fetched:',
            id,
            res ? [res.title, res.artist, res.creator, res.status].join(' | ') : res,
        )
    }
}

export default MapsetsCollector
