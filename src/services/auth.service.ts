import axios from 'axios'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import { usersTokens } from '../db/schema'
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


export async function login(db: any, userOsuApiCode: string) {
    try {
        const { authResult, extractedData } = await fetchOsuUser(userOsuApiCode)

        let user = await getUserByOsuId(db, extractedData.id)

        if (!user) {
            user = await createUser(db, extractedData)
        } else {
            await updateUser(db, user.id, extractedData)
        }

        await saveUserToken(db, user.id, authResult)

        return user

    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.log(err.response?.data)
            console.log(err.config?.url)
        } else {
            console.log(err)
        }
    }
}

async function saveUserToken(db: any, userId: number, authResult: any) {
    const expiresAt = new Date(Date.now() + authResult.expiresIn * 1000)

    await db.insert(usersTokens).values({
        user_id: userId,
        access_token: authResult.token,
        refresh_token: authResult.refreshToken,
        expires_at: expiresAt,
    })
}

async function updateUser(db: any, userId: number, data: any) {
    await db.update(users)
        .set({
            name: data.username,
            avatar_url: data.avatar_url,
            pp: Math.floor(data.pp),
            country: data.country,
        })
        .where(eq(users.id, userId))
}

async function createUser(db: any, data: any) {
    const inserted = await db.insert(users).values({
        osu_id: data.id,
        name: data.username,
        avatar_url: data.avatar_url,
        pp: Math.floor(data.pp),
        country: data.country,
    }).returning()

    return inserted[0]
}

async function getUserByOsuId(db: any, osuId: number) {
    return db
        .select()
        .from(users)
        .where(eq(users.osu_id, osuId))
        .then((res: typeof users.$inferSelect[]) => res[0])
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
        pp: raw.statistics.pp
    }
}
