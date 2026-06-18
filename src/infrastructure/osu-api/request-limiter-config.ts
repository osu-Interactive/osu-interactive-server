import Bottleneck from 'bottleneck'
import { attachLimiterLogger } from '@/infrastructure/osu-api/bottleneck-requests-logger'

let requestLimit: number
let highWater: number

if (!process.env.OSU_API_REQUESTS_IN_MINUTE) {
    throw new Error('OSU_API_REQUESTS_IN_MINUTE is not defined in .env')
}

if (!process.env.OSU_API_REQUESTS_HIGH_WATER) {
    throw new Error('OSU_API_HIGH_WATER is not defined in .env')
}

requestLimit = parseInt(process.env.OSU_API_REQUESTS_IN_MINUTE)
highWater = parseInt(process.env.OSU_API_REQUESTS_HIGH_WATER)

export const osuApiLimiter = new Bottleneck({
    reservoir: requestLimit,
    reservoirRefreshAmount: requestLimit,
    reservoirRefreshInterval: 60_000, // 1 min

    maxConcurrent: 3,

    highWater: highWater,
    strategy: Bottleneck.strategy.OVERFLOW,
})

if (process.env.LOG_OSU_API_REQUESTS === 'true') {
    attachLimiterLogger(osuApiLimiter)
}
