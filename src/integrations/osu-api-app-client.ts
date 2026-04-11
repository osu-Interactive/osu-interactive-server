import axios, { AxiosResponse } from 'axios'
import BaseOsuApiClient from './base-osu-api-client'

interface OsuCredentialTokenResponse {
    access_token: string
    expires_in: number
    token_type: string
}

class OsuApiAppClient extends BaseOsuApiClient {
    private appTokenState: {
        token: string | null
        expiresAt: number | null
        tokenPromise: Promise<string> | null
    } = {
        token: null,
        expiresAt: null,
        tokenPromise: null
    }

    public constructor() {
        super()
    }

    private async fetchAccessTokenCredential(): Promise<{
        token: string
        expiresIn: number
    }> {
        const res: AxiosResponse<OsuCredentialTokenResponse> = await axios.post(
            `${this.baseUrl}/oauth/token`,
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
                'Content-Type': 'application/json',
                'Accept': 'application/json',
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
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        })
    }
}

export default OsuApiAppClient
