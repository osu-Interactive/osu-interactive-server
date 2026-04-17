import axios from 'axios'
import type { DB } from "../types/drizzle-pg-db";
import OsuApiUserClient from '../integrations/osu-api-user-client'
import { OsuApiUser, OsuUserExtracted } from '../types/osu'
import type { Models } from '../types/models'

const api = new OsuApiUserClient()

export function getOsuApiAuthLink(state: string) {
    const osuApiClientId: string = String(process.env.CLIENT_ID)

    return (
        'https://osu.ppy.sh/oauth/authorize' +
        `?client_id=${osuApiClientId}` +
        '&redirect_uri=http://localhost:5173/login' +
        '&response_type=code' +
        '&scope=public+identify' +
        `&state=${state}`
    )
}

export async function login(
    userModel: Models['user'],
    db: DB,
    userOsuApiCode: string
) {
    try {
        const { authResult, extractedData } =
            await fetchOsuUser(userOsuApiCode)
        console.log(extractedData)
        return await db.transaction(async () => {
            let user = await userModel.getByOsuId(extractedData.id)
            if (!user) {
                user = await userModel.upsertFromOsu(extractedData)
            } else {
                await userModel.updateById(user.id, extractedData)
            }

            await userModel.saveToken(user.id, authResult)
            console.log('user saved successfully')
            return user
        })
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.log(err.response?.data)
            console.log(err.config?.url)
        } else {
            console.log(err)
        }
    }
}

async function fetchOsuUser(userOsuApiCode: string) {
    const authResult = await api.fetchAccessTokenCodeGrant(userOsuApiCode)
    const userData = await api.getUserDataFromOsuApi(authResult.token)

    return {
        authResult,
        extractedData: extractUserData(userData),
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
        pp: raw.statistics.pp,
    }
}
