import axios from 'axios'
import BaseOsuApiClient from './base-osu-api-client'
import type {
    OsuAuthToken,
    OsuCodeGrantTokenResponse,
    OsuApiUser,
} from '@/types/osu.types'

class OsuApiUserClient extends BaseOsuApiClient {
    public constructor() {
        super()
    }

    public async getUserDataFromOsuApi(userToken: string): Promise<OsuApiUser> {
        const res = await axios.get<OsuApiUser>(`${this.baseUrl}/api/v2/me`, {
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        })

        return res.data
    }

    //TODO: Response with dynamic redirect url
    //TODO: Handle if too many requests
    public async fetchAccessTokenCodeGrant(
        userOsuApiCode: string,
    ): Promise<OsuAuthToken> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code: userOsuApiCode,
            grant_type: 'authorization_code',
            scope: 'public',
            redirect_uri: `http://localhost:5173/login`,
        })

        const res = await axios.post<OsuCodeGrantTokenResponse>(
            `${this.baseUrl}/oauth/token/`,
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
            refreshToken: res.data.refresh_token,
        }
    }
}

export default OsuApiUserClient
