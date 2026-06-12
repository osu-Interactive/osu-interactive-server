import Bottleneck from 'bottleneck'
import { osuApiLimiter } from './request-limiter-config'

abstract class BaseApiClient {
    protected readonly clientId: string
    protected readonly clientSecret: string
    protected readonly baseUrl: string
    protected readonly limiter: Bottleneck

    protected constructor() {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
            throw new Error('CLIENT_ID or CLIENT_SECRET is not defined')
        }

        this.clientId = process.env.CLIENT_ID
        this.clientSecret = process.env.CLIENT_SECRET
        this.baseUrl = 'https://osu.ppy.sh'
        this.limiter = osuApiLimiter
    }
}

export default BaseApiClient
