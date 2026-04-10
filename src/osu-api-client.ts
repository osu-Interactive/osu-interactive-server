import axios, { AxiosResponse } from 'axios'

interface OsuCredentialTokenResponse {
    access_token: string
    expires_in: number
    token_type: string
}

interface OsuCodeGrantTokenResponse {
    access_token: string
    expires_in: number
    refresh_token: string
    token_type: string
}

class OsuApiClient {
    private clientId: string
    private clientSecret: string
    private baseUrl: string

    private appTokenState: {
        token: string | null
        expiresAt: number | null
        tokenPromise: Promise<string> | null
    } = {
        token: null,
        expiresAt: null,
        tokenPromise: null
    }

    private static instance: OsuApiClient

    private constructor() {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
            throw new Error('CLIENT_ID or CLIENT_SECRET is not defined')
        }

        this.clientId = process.env.CLIENT_ID
        this.clientSecret = process.env.CLIENT_SECRET

        this.baseUrl = 'https://osu.ppy.sh/api/v2'
    }

    public static getInstance(): OsuApiClient {
        if (!OsuApiClient.instance) {
            OsuApiClient.instance = new OsuApiClient()
        }
        return OsuApiClient.instance
    }

    public async getUserDataFromOsuApi(userToken: string) {
        const res: AxiosResponse = await axios.get(
            'https://osu.ppy.sh/api/v2/me',
            {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            },
        )

        console.log(res.data)

        return res.data
    }

    public async fetchAccessTokenCodeGrant(userOsuApiCode: string): Promise<{
        token: string
        expiresIn: number
        refreshToken: string
    }> {

        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code: userOsuApiCode,
            grant_type: "authorization_code",
            scope: "public",
            redirect_uri: `http://localhost:5173/login`,
        });

        const res: AxiosResponse<OsuCodeGrantTokenResponse> = await axios.post(
            "https://osu.ppy.sh/oauth/token/",
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                },
            }
        );

        return {
            token: res.data.access_token,
            expiresIn: res.data.expires_in,
            refreshToken: res.data.refresh_token,
        }
    }

    private async fetchAccessTokenCredential(): Promise<{
        token: string
        expiresIn: number
    }> {
        const res: AxiosResponse<OsuCredentialTokenResponse> = await axios.post(
            'https://osu.ppy.sh/oauth/token',
            `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials&scope=public`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
            },
        )

        return {
            token: res.data.access_token,
            expiresIn: res.data.expires_in,
        }
    }

    private async ensureToken(): Promise<string> {
        if (
            this.appTokenState.token &&
            this.appTokenState.expiresAt &&
            Date.now() < this.appTokenState.expiresAt
        ) {
            return this.appTokenState.token
        }

        if (this.appTokenState.tokenPromise) {
            return this.appTokenState.tokenPromise
        }

        this.appTokenState.tokenPromise = this.fetchAccessTokenCredential().then(
            ({ token, expiresIn }) => {
                this.appTokenState.token = token
                this.appTokenState.expiresAt = Date.now() + expiresIn * 1000 - 5000

                this.appTokenState.tokenPromise = null
                return token
            },
        )

        return this.appTokenState.tokenPromise
    }

    public async get<T = any>(endpoint: string): Promise<AxiosResponse<T>> {
        const token = await this.ensureToken()

        return axios.get<T>(this.baseUrl + endpoint, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    }

    public async post<T = any>(
        endpoint: string,
        data?: any,
    ): Promise<AxiosResponse<T>> {
        const token = await this.ensureToken()

        return axios.post<T>(this.baseUrl + endpoint, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    }
}

export const osuApiClient = OsuApiClient.getInstance()
