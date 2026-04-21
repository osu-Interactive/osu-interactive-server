import axios, { AxiosResponse } from 'axios'
import BaseOsuApiClient from './base-osu-api-client'
import type { OsuCredentialTokenResponse } from '../types/osu.types'

class OsuApiAppClient extends BaseOsuApiClient {
    private token: string | null = null
    private expiresAt: number | null = null
    private tokenPromise: Promise<string> | null = null

    public constructor() {
        super()
    }

    private async fetchAccessTokenCredential(): Promise<{
        token: string
        expiresIn: number
    }> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials',
            scope: 'public',
        })

        const res: AxiosResponse<OsuCredentialTokenResponse> = await axios.post(
            `${this.baseUrl}/oauth/token`,
            params,
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
            this.token &&
            this.expiresAt &&
            Date.now() < this.expiresAt
        ) {
            return this.token
        }

        if (this.tokenPromise) {
            return this.tokenPromise
        }

        this.tokenPromise = this.fetchAccessTokenCredential().then(
            ({ token, expiresIn }) => {
                this.token = token
                this.expiresAt = Date.now() + expiresIn * 1000 - 5000

                this.tokenPromise = null
                return token
            },
        ).catch((err) => {
            this.tokenPromise = null
            throw err
        })

        return this.tokenPromise
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
