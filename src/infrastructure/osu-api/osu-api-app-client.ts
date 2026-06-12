import axios, { AxiosResponse } from 'axios'
import BaseOsuApiClient from './base-osu-api-client'
import type { OsuCredentialTokenResponse } from '@/types/osu.types'

class OsuApiAppClient extends BaseOsuApiClient {
    private token: string | null = null
    private expiresAt: number | null = null
    private tokenPromise: Promise<string> | null = null
    private refreshPromise: Promise<string> | null = null

    public constructor() {
        super()
    }

    public get<T = any>(endpoint: string): Promise<AxiosResponse<T>> {
        return this.authorizedRequest((token) => {
            return this.limiter.schedule(
                { id: `[APP_CLIENT: GET /api/v2${endpoint}]` },
                () =>
                    axios.get<T>(this.baseUrl + '/api/v2' + endpoint, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                        },
                    }),
            )
        })
    }

    public post<T = any>(
        endpoint: string,
        data?: any,
    ): Promise<AxiosResponse<T>> {
        return this.authorizedRequest((token) => {
            return this.limiter.schedule(
                { id: `[APP_CLIENT: POST /api${endpoint}]` },
                () =>
                    axios.post<T>(this.baseUrl + '/api' + endpoint, data, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                    }),
            )
        })
    }

    private async authorizedRequest<T>(
        callback: (token: string) => Promise<AxiosResponse<T>>,
    ): Promise<AxiosResponse<T>> {
        const token = await this.ensureToken()

        try {
            return await callback(token)
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.status !== 401) {
                throw err
            }

            this.invalidateToken(token)

            const newToken = await this.ensureToken(true)

            return callback(newToken)
        }
    }

    private async ensureToken(forceRefresh = false): Promise<string> {
        if (
            !forceRefresh &&
            this.hasValidToken() &&
            typeof this.token === 'string'
        ) {
            return this.token
        }

        if (this.refreshPromise) {
            return this.refreshPromise
        }

        if (!forceRefresh && this.tokenPromise) {
            return this.tokenPromise
        }

        return this.createTokenPromise(forceRefresh)
    }

    private invalidateToken(token: string): void {
        if (this.token === token) {
            this.token = null
            this.expiresAt = null
        }
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

        const res: AxiosResponse<OsuCredentialTokenResponse> =
            await this.limiter.schedule(
                { id: '[APP_CLIENT: POST /oauth/token]' },
                () =>
                axios.post(`${this.baseUrl}/oauth/token`, params, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json',
                    },
                }),
            )

        return {
            token: res.data.access_token,
            expiresIn: res.data.expires_in,
        }
    }

    private hasValidToken(): boolean {
        return (
            this.token !== null &&
            this.expiresAt !== null &&
            Date.now() < this.expiresAt
        )
    }

    private createTokenPromise(forceRefresh: boolean): Promise<string> {
        const promise = this.fetchAccessTokenCredential().then(
            ({ token, expiresIn }) => {
                this.token = token
                this.expiresAt = Date.now() + expiresIn * 1000 - 10000

                return token
            },
        )

        if (forceRefresh) {
            this.refreshPromise = promise.finally(() => {
                this.refreshPromise = null
            })

            return this.refreshPromise
        }

        this.tokenPromise = promise.finally(() => {
            this.tokenPromise = null
        })

        return this.tokenPromise
    }
}

export default new OsuApiAppClient()
