import axios from 'axios'
import { eq } from 'drizzle-orm'
import { users, usersTokens } from '../db/schema'
import type { DB } from "../types/drizzle-pg-db";
import OsuApiUserClient, {
    OsuApiUser,
} from '../integrations/osu-api-user-client'

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

export async function login(db: DB, userOsuApiCode: string) {
    try {
        const { authResult, extractedData } = await fetchOsuUser(userOsuApiCode)

        return await db.transaction(async (tx: any) => {
            let user = await getUserByOsuId(tx, extractedData.id)

            if (!user) {
                user = await upsertUser(tx, extractedData)
            } else {
                await updateUser(tx, user.id, extractedData)
            }

            await saveUserToken(tx, user.id, authResult)

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

async function getUserByOsuId(db: DB, osuId: number) {
    return db
        .select()
        .from(users)
        .where(eq(users.osu_id, osuId))
        .then((res: (typeof users.$inferSelect)[]) => res[0])
}

async function upsertUser(db: DB, data: any) {
    const result = await db
        .insert(users)
        .values({
            osu_id: data.id,
            name: data.username,
            avatar_url: data.avatar_url,
            pp: Math.floor(data.pp),
            country: data.country,
        })
        .onConflictDoUpdate({
            target: users.osu_id,
            set: {
                name: data.username,
                avatar_url: data.avatar_url,
                pp: Math.floor(data.pp),
                country: data.country,
            },
        })
        .returning()

    return result[0]
}

async function updateUser(db: DB, userId: number, data: any) {
    await db
        .update(users)
        .set({
            name: data.username,
            avatar_url: data.avatar_url,
            pp: Math.floor(data.pp),
            country: data.country,
        })
        .where(eq(users.id, userId))
}

async function saveUserToken(db: DB, userId: number, authResult: any) {
    const expiresAt = new Date(Date.now() + authResult.expiresIn * 1000)

    await db
        .insert(usersTokens)
        .values({
            user_id: userId,
            access_token: authResult.token,
            refresh_token: authResult.refreshToken,
            expires_at: expiresAt,
        })
        .onConflictDoUpdate({
            target: usersTokens.user_id,
            set: {
                access_token: authResult.token,
                refresh_token: authResult.refreshToken,
                expires_at: expiresAt,
            },
        })
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
