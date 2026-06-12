import { eq } from 'drizzle-orm'
import { users, usersOauthTokens } from '../db/schemas/schema'
import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import type { OsuAuthToken, OsuUserExtracted, DBUser } from '@/types/osu.types'
import { AppError } from '@/errors/app-error'

export type UserModel = ReturnType<typeof userModel>

const getUserDBValues = (user: OsuUserExtracted) => ({
    name: user.username,
    avatar_url: user.avatar_url,
    pp: Math.floor(user.pp),
    country: user.country,
})

const getUserTokensDBValues = (data: OsuAuthToken) => {
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000)

    return {
        access_token: data.token,
        refresh_token: data.refreshToken,
        expires_at: expiresAt,
    }
}

export const userModel = (db: DBExecutor) => ({
    async requireById(id: number): Promise<DBUser> {
        const res = await this.getById(id)

        if (typeof res === 'undefined')
            throw new AppError(`User ${id} not found`, { code: 'USER_NOT_FOUND' })

        return res
    },

    getById(id: number): Promise<DBUser | undefined> {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
        })
    },

    getByOsuId(osuId: number): Promise<DBUser | undefined> {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.osu_id, osuId),
        })
    },

    //Note: osu! usernames are case-insensitive, but this search isn't.
    getByUserName(name: string): Promise<DBUser | undefined> {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.name, name),
        })
    },

    async upsertFromOsu(data: OsuUserExtracted) {
        const result = await db
            .insert(users)
            .values({
                osu_id: data.id,
                ...getUserDBValues(data),
            })
            .onConflictDoUpdate({
                target: users.osu_id,
                set: getUserDBValues(data),
            })
            .returning()

        return result[0]
    },

    async updateById(userId: number, data: OsuUserExtracted) {
        await db
            .update(users)
            .set(getUserDBValues(data))
            .where(eq(users.id, userId))
    },

    async saveToken(userId: number, authResult: OsuAuthToken) {
        await db
            .insert(usersOauthTokens)
            .values({
                user_id: userId,
                ...getUserTokensDBValues(authResult),
            })
            .onConflictDoUpdate({
                target: usersOauthTokens.user_id,
                set: getUserTokensDBValues(authResult),
            })
    },
})
