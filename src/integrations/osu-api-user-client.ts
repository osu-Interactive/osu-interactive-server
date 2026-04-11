import axios from 'axios'
import BaseOsuApiClient from './base-osu-api-client'

type OsuCodeGrantTokenResponse = {
    access_token: string
    expires_in: number
    refresh_token: string
    token_type: string
}

//osu api '/me' contains a lot of fields, but currently we need only these
export type OsuApiUser = {
    id: number
    username: string
    avatar_url: string
    country: {
        code: string
        name: string
    }
    statistics: {
        pp: number
    }
}

type OsuAuthToken = {
    token: string
    expiresIn: number
    refreshToken: string
}

class OsuApiUserClient extends BaseOsuApiClient {
    public constructor() {
        super()
    }

    public async getUserDataFromOsuApi(userToken: string): Promise<OsuApiUser> {
        const res = await axios.get<OsuApiUser>(
            `${this.baseUrl}/api/v2/me`,
            {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            }
        )

        return res.data
    }

    public async fetchAccessTokenCodeGrant(userOsuApiCode: string): Promise<OsuAuthToken> {
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code: userOsuApiCode,
            grant_type: "authorization_code",
            scope: "public",
            redirect_uri: `http://localhost:5173/login`,
        });

        const res = await axios.post<OsuCodeGrantTokenResponse>(
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
