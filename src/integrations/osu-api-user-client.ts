import axios, { AxiosResponse } from 'axios'
import BaseOsuApiClient from './base-osu-api-client'

interface OsuCodeGrantTokenResponse {
    access_token: string
    expires_in: number
    refresh_token: string
    token_type: string
}

class OsuApiUserClient extends BaseOsuApiClient {
    public constructor() {
        super()
    }

    public async getUserDataFromOsuApi(userToken: string) {
        const res: AxiosResponse = await axios.get(
            `${this.baseUrl}/api/v2/me`,
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
            `${this.baseUrl}/oauth/token/`,
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
}

export default OsuApiUserClient
