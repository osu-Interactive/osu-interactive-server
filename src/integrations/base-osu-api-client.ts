abstract class BaseApiClient {
    protected readonly clientId: string
    protected readonly clientSecret: string
    protected readonly baseUrl: string

    protected constructor() {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
            throw new Error('CLIENT_ID or CLIENT_SECRET is not defined')
        }

        this.clientId = process.env.CLIENT_ID
        this.clientSecret = process.env.CLIENT_SECRET
        this.baseUrl = 'https://osu.ppy.sh'
    }
}

export default BaseApiClient;
