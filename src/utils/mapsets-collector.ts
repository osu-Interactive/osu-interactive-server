import { getMapset } from '@/services/osu/beatmaps.service'

interface RequestsThisMinute {
    count: number
    time: number
}

class MapsetsCollector {
    private readonly requestsLimit: number

    private requestsThisMinute: RequestsThisMinute = {
        count: 0,
        time: 0,
    }

    constructor(requestsInMin: number) {
        this.requestsLimit = requestsInMin

        this.scheduleRequestsReset()
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

    private async waitForRequestsThisMinuteReset(): Promise<void> {
        const waitMs = 60000 - this.requestsThisMinute.time * 1000 + 200

        console.log(`⌛ Waiting for rate limit reset in ${waitMs} ms...`)

        await new Promise<void>((resolve) => setTimeout(resolve, waitMs))
    }

    public async startFetching(
        amountToFetch: number,
        startId: number,
    ): Promise<void> {
        let fetchedCount = 0
        console.log(fetchedCount, amountToFetch)
        while (fetchedCount < amountToFetch) {
            await this.fetchBeatmapset(startId)

            fetchedCount++
            startId++
        }

        console.log(`✅ Fetched ${fetchedCount} beatmapsets, fetching complete.`)
    }

    private async fetchBeatmapset(id: number): Promise<void> {
        if (this.requestsThisMinute.count >= this.requestsLimit) {
            await this.waitForRequestsThisMinuteReset()
        }

        this.requestsThisMinute.count++

        const res = await getMapset(id)

        console.log('🎵 Beatmapset fetched:', id, res)
    }
}

export default new MapsetsCollector(250)
