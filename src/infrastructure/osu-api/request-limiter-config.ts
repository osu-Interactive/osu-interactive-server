import Bottleneck from 'bottleneck'
import { attachLimiterLogger } from '@/infrastructure/osu-api/bottleneck-requests-logger'
import { env } from '@/config/env'

let requestLimit: number
let highWater: number

requestLimit = env.OSU_API_REQUESTS_IN_MINUTE
highWater = env.OSU_API_REQUESTS_HIGH_WATER

export const osuApiLimiter = new Bottleneck({
    reservoir: requestLimit,
    reservoirRefreshAmount: requestLimit,
    reservoirRefreshInterval: 60_000, // 1 min

    maxConcurrent: 3,

    highWater: highWater,
    strategy: Bottleneck.strategy.OVERFLOW,
})

if (env.LOG_OSU_API_REQUESTS) {
    attachLimiterLogger(osuApiLimiter)
}
