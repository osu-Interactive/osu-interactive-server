import Bottleneck from 'bottleneck'
import { attachLimiterLogger } from '@/infrastructure/osu-api/bottleneck-requests-logger'
import { env } from '@/config/env'

const requestLimit = env.OSU_API_REQUESTS_IN_MINUTE
const heavyRequestLimit = env.OSU_API_HEAVY_REQUESTS_IN_MINUTE
const highWater = env.OSU_API_REQUESTS_HIGH_WATER

export const osuApiLimiter = new Bottleneck({
    reservoir: requestLimit,
    reservoirRefreshAmount: requestLimit,
    reservoirRefreshInterval: 60_000,

    maxConcurrent: 3,

    highWater,
    strategy: Bottleneck.strategy.OVERFLOW,
})

export const osuHeavyApiLimiter = new Bottleneck({
    reservoir: heavyRequestLimit,
    reservoirRefreshAmount: heavyRequestLimit,
    reservoirRefreshInterval: 60_000,

    highWater,
    strategy: Bottleneck.strategy.OVERFLOW,
})

osuHeavyApiLimiter.chain(osuApiLimiter)

if (env.LOG_OSU_API_REQUESTS) {
    attachLimiterLogger(osuApiLimiter)
}
