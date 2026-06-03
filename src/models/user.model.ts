import { eq } from 'drizzle-orm'
import { users, usersOauthTokens } from '../db/schemas/schema'
import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import type { OsuAuthToken, OsuUserExtracted, DBUser } from '@/types/osu.types'
import { AppError } from '@/errors/app-error'

type FindUserResult<FailIfNotFound extends boolean> =
    FailIfNotFound extends true ? DBUser : DBUser | undefined

export type UserModel = ReturnType<typeof userModel>

export const userModel = (db: DBExecutor) => ({
    async getById<FailIfNotFound extends boolean = false>(
        id: number,
        failIfNotFound?: FailIfNotFound,
    ): Promise<FindUserResult<FailIfNotFound>> {
        const res = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
        })

        return this.failOrReturnUser(res, failIfNotFound)
    },

    async getByOsuId<FailIfNotFound extends boolean = false>(
        osuId: number,
        failIfNotFound?: FailIfNotFound,
    ): Promise<FindUserResult<FailIfNotFound>> {
        const res = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.osu_id, osuId),
        })

        return this.failOrReturnUser(res, failIfNotFound)
    },

    async getByUserName<FailIfNotFound extends boolean = false>(
        name: string,
        failIfNotFound?: FailIfNotFound,
    ): Promise<FindUserResult<FailIfNotFound>> {
        const res = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.name, name),
        })

        return this.failOrReturnUser(res, failIfNotFound)
    },

    failOrReturnUser<FailIfNotFound extends boolean = false>(
        user: DBUser | undefined,
        failIfNotFound?: FailIfNotFound,
    ): FindUserResult<FailIfNotFound> {
        if (!user && failIfNotFound) {
            throw new AppError('User not found', {
                code: 'USER_NOT_FOUND',
            })
        }

        return user as FindUserResult<FailIfNotFound>
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

    async updateById(userId: number, data: OsuUserExtracted) {
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
    }
})
