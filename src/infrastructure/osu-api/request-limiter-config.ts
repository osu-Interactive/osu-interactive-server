import Bottleneck from 'bottleneck'
import { attachLimiterLogger } from '@/infrastructure/osu-api/bottleneck-requests-logger'

let requestLimit: number

if (!process.env.OSU_API_REQUESTS_IN_MINUTE) {
    throw new Error('No requests limit is defined for osu api in .env')
}

requestLimit = parseInt(process.env.OSU_API_REQUESTS_IN_MINUTE)

export const osuApiLimiter = new Bottleneck({
    reservoir: requestLimit,
    reservoirRefreshAmount: requestLimit,
    reservoirRefreshInterval: 60_000, // 1 min

    maxConcurrent: 3,

    highWater: requestLimit,
    strategy: Bottleneck.strategy.OVERFLOW,
})

if (process.env.LOG_OSU_API_REQUESTS === 'true') {
    attachLimiterLogger(osuApiLimiter)
}
