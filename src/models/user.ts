import { eq } from 'drizzle-orm'
import { users, usersTokens } from '../db/schema'
import type { DB } from '../types/drizzle-pg-db'
import type { OsuAuthToken, OsuUserExtracted } from '../types/osu'

export const userModel = (db: DB) => ({
    async getById(id: number) {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
        })
    },

    async getByOsuId(osuId: number) {
        return db.query.users.findFirst({
            where: (users, { eq }) => eq(users.osu_id, osuId),
        })
    },

    async getByUserName(name: string) {
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
    },
})
