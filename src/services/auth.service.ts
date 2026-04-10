import { osuApiClient } from '../osu-api-client'
import axios from 'axios'

export function getOsuApiAuthLink() {
    const osuApiClientId: string = String(process.env.CLIENT_ID)

    return (
        'https://osu.ppy.sh/oauth/authorize' +
        `?client_id=${osuApiClientId}` +
        '&redirect_uri=http://localhost:5173/login' +
        '&response_type=code' +
        '&scope=public+identify' +
        '&state=randomval'
    )
}

export async function login(userOsuApiCode: string) {
    try {
        const authResult =
            await osuApiClient.fetchAccessTokenCodeGrant(userOsuApiCode)
        console.log(authResult.token)

        const userData = await osuApiClient.getUserDataFromOsuApi(
            authResult.token,
        )
        console.log(123, userData)
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.log(err.response?.data)
            console.log(err.config?.url)
        } else {
            console.log(err)
        }
    }
}
