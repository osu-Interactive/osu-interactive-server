import Bottleneck from 'bottleneck'
import { osuApiLimiter } from './request-limiter-config'
import { env } from '@/config/env'

abstract class BaseApiClient {
    protected readonly clientId
    protected readonly clientSecret
    protected readonly baseUrl
    protected readonly limiter: Bottleneck

    protected constructor() {
        this.clientId = env.CLIENT_ID
        this.clientSecret = env.CLIENT_SECRET
        this.baseUrl = 'https://osu.ppy.sh'
        this.limiter = osuApiLimiter
    }
}

export default BaseApiClient
