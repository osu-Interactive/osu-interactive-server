import axios from 'axios'
import OsuApiUserClient, { OsuApiUser } from '../integrations/osu-api-user-client'
const api = new OsuApiUserClient()


type OsuUserExtracted = {
    id: number
    username: string
    avatar_url: string
    country: {
        code: string
        name: string
    }
    pp: number
}

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
        const authResult = await api.fetchAccessTokenCodeGrant(userOsuApiCode)
        const userData = await api.getUserDataFromOsuApi(authResult.token)
        console.log(userData)
        const extractedData = extractUserData(userData)

        console.log(123, extractedData)
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.log(err.response?.data)
            console.log(err.config?.url)
        } else {
            console.log(err)
        }
    }
}

function extractUserData(raw: OsuApiUser): OsuUserExtracted {
    return {
        id: raw.id,
        username: raw.username,
        avatar_url: raw.avatar_url,
        country: {
            code: raw.country.code,
            name: raw.country.name,
        },
        pp: raw.statistics.pp
    }
}
