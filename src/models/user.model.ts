import { eq } from 'drizzle-orm'
import { users, usersOauthTokens } from '../db/schemas/schema'
import type { DB } from '@/types/drizzle-pg-db.types'
import type { OsuAuthToken, OsuUserExtracted, DBUser } from '@/types/osu.types'

export const userModel = (db: DB) => ({
    async getById(id: number): Promise<DBUser | undefined> {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
        })
    },

    async getByOsuId(osuId: number): Promise<DBUser | undefined>  {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.osu_id, osuId),
        })
    },

    async getByUserName(name: string): Promise<DBUser | undefined>  {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.name, name),
        })
    },

    async upsertFromOsu(data: OsuUserExtracted) {
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
    },

    async updateById(
        userId: number,
        data: OsuUserExtracted,
    ) {
        await db
            .update(users)
            .set({
                name: data.username,
                avatar_url: data.avatar_url,
                pp: Math.floor(data.pp),
                country: data.country,
            })
            .where(eq(users.id, userId))
    },

    async saveToken(userId: number, authResult: OsuAuthToken) {
        const expiresAt = new Date(Date.now() + authResult.expiresIn * 1000)

        await db
            .insert(usersOauthTokens)
            .values({
                user_id: userId,
                access_token: authResult.token,
                refresh_token: authResult.refreshToken,
                expires_at: expiresAt,
            })
            .onConflictDoUpdate({
                target: usersOauthTokens.user_id,
                set: {
                    access_token: authResult.token,
                    refresh_token: authResult.refreshToken,
                    expires_at: expiresAt,
                },
            })
    },
})
