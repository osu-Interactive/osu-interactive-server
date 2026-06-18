import { getMapset } from '@/services/beatmaps.service'
import { BeatmapsModel } from '@/models/beatmaps.model'

class MapsetsCollector {
    private readonly requestsLimit: number

    private requestsThisMinute = {
        count: 0,
        time: 0,
    }

    constructor(requestsInMin: number) {
        this.requestsLimit = requestsInMin

        this.scheduleRequestsReset()
    }

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

    private scheduleRequestsReset(): void {
        setInterval(() => {
            this.requestsThisMinute.count = 0
            this.requestsThisMinute.time = 0
        }, 60000)

        setInterval(() => {
            this.requestsThisMinute.time++
        }, 1000)
    }

    private async fetchBeatmapset(mapsetModel: BeatmapsModel, id: number): Promise<void> {
        if (this.requestsThisMinute.count >= this.requestsLimit) {
            await this.waitForRateLimitReset()
        }

        this.requestsThisMinute.count++

        const res = await getMapset(mapsetModel, id, { raw: true })

        console.log(
            '🎵 Beatmapset fetched:',
            id,
            res ? [res.title, res.artist, res.creator, res.status].join(' | ') : res,
        )
    }

    private async waitForRateLimitReset(): Promise<void> {
        const waitMs = 60000 - this.requestsThisMinute.time * 1000 + 200

        console.log(`⌛ Waiting for rate limit reset in ${waitMs} ms...`)

        await new Promise<void>((resolve) => setTimeout(resolve, waitMs))
    }
}

export default new MapsetsCollector(250)
