import { eq } from 'drizzle-orm'
import { users, usersOauthTokens, usersRefreshTokens, userPreferences } from '../db/schemas/schema'
import { AppError } from '@/errors/app-error'
import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import { OsuAuthToken, OsuUserExtracted, DBUser, SharedSkillsets } from '@/types/osu.types'

export type UserModelFactory = typeof userModel
export type UserModel = ReturnType<UserModelFactory>

const getUserDBValues = (user: OsuUserExtracted) => ({
    name: user.username,
    avatarUrl: user.avatar_url,
    pp: Math.floor(user.pp),
    country: user.country,
})

const getUserTokensDBValues = (data: OsuAuthToken) => {
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000)

    return {
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresAt: expiresAt,
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
            where: (users, { eq }) => eq(users.osuId, osuId),
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
                osuId: data.id,
                ...getUserDBValues(data),
            })
            .onConflictDoUpdate({
                target: users.osuId,
                set: getUserDBValues(data),
            })
            .returning()

        return result[0]
    },

    saveToken(userId: number, authResult: OsuAuthToken) {
        return db
            .insert(usersOauthTokens)
            .values({
                userId: userId,
                ...getUserTokensDBValues(authResult),
            })
            .onConflictDoUpdate({
                target: usersOauthTokens.userId,
                set: getUserTokensDBValues(authResult),
            })
    },

    setRefreshToken(userId: number, tokenId: string, tokenHash: string, expiresAt: Date) {
        return db.insert(usersRefreshTokens).values({
            userId: userId,
            tokenId: tokenId,
            tokenHash: tokenHash,
            expiresAt: expiresAt,
        })
    },

    getValidRefreshToken(userId: number, tokenId: string) {
        return db.query.usersRefreshTokens.findFirst({
            where: (tokens, { and, eq, isNull, gt }) =>
                and(
                    eq(tokens.userId, userId),
                    eq(tokens.tokenId, tokenId),
                    isNull(tokens.revokedAt),
                    gt(tokens.expiresAt, new Date()),
                ),
        })
    },

    updateRefreshToken(id: number) {
        return db
            .update(usersRefreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(usersRefreshTokens.id, id))
    },

    initializePreferences(userId: number, skillsetsShares: SharedSkillsets) {
        const preferences = {
            userId,
            jumps: 0,
            streams: 0,
            fingerControl: 0,
            tech: 0,
            alternate: 0,
            gimmick: 0,
        }

        for (const { skillset, share } of skillsetsShares) {
            preferences[skillset] = share
        }

        return db
            .insert(userPreferences)
            .values(preferences)
            .onConflictDoUpdate({
                target: userPreferences.userId,
                set: {
                    jumps: preferences.jumps,
                    streams: preferences.streams,
                    fingerControl: preferences.fingerControl,
                    tech: preferences.tech,
                    alternate: preferences.alternate,
                    gimmick: preferences.gimmick,
                },
            })
    },
})
