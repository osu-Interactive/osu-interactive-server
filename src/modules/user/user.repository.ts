import { eq } from 'drizzle-orm'
import {
    users,
    usersOauthTokens,
    usersRefreshTokens,
    userPreferences,
    userFatigue,
} from '../../db/schemas/schema'
import { AppError } from '@/errors/app-error'
import { codes, type Skillset } from '@/config/seeds/skillsets-seed'

import type { OsuUserExtracted, SharedSkillsets } from './user.types'
import type { DBUser } from '@/shared/types/db.types'
import type { OsuAuthToken } from '@/modules/auth/auth.types'
import type { DBExecutor } from '@/shared/types/db.types'

class UserRepository {
    constructor(private readonly db: DBExecutor) {}

    async requireById(id: number): Promise<DBUser> {
        const res = await this.getById(id)

        if (typeof res === 'undefined')
            throw new AppError(`User ${id} not found`, { code: 'USER_NOT_FOUND' })

        return res
    }

    getById(id: number): Promise<DBUser | undefined> {
        return this.db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, id),
        })
    }

    getByOsuId(osuId: number): Promise<DBUser | undefined> {
        return this.db.query.users.findFirst({
            where: (users, { eq }) => eq(users.osuId, osuId),
        })
    }

    //Note: osu! usernames are case-insensitive, but this search isn't.
    getByUserName(name: string): Promise<DBUser | undefined> {
        return this.db.query.users.findFirst({
            where: (users, { eq }) => eq(users.name, name),
        })
    }

    async upsertFromOsu(data: OsuUserExtracted) {
        const result = await this.db
            .insert(users)
            .values({
                osuId: data.id,
                ...this.getUserDBValues(data),
            })
            .onConflictDoUpdate({
                target: users.osuId,
                set: this.getUserDBValues(data),
            })
            .returning()

        return result[0]
    }

    saveToken(userId: number, authResult: OsuAuthToken) {
        return this.db
            .insert(usersOauthTokens)
            .values({
                userId: userId,
                ...this.getUserTokensDBValues(authResult),
            })
            .onConflictDoUpdate({
                target: usersOauthTokens.userId,
                set: this.getUserTokensDBValues(authResult),
            })
    }

    setRefreshToken(userId: number, tokenId: string, tokenHash: string, expiresAt: Date) {
        return this.db.insert(usersRefreshTokens).values({
            userId: userId,
            tokenId: tokenId,
            tokenHash: tokenHash,
            expiresAt: expiresAt,
        })
    }

    getValidRefreshToken(userId: number, tokenId: string) {
        return this.db.query.usersRefreshTokens.findFirst({
            where: (tokens, { and, eq, isNull, gt }) =>
                and(
                    eq(tokens.userId, userId),
                    eq(tokens.tokenId, tokenId),
                    isNull(tokens.revokedAt),
                    gt(tokens.expiresAt, new Date()),
                ),
        })
    }

    updateRefreshToken(id: number) {
        return this.db
            .update(usersRefreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(usersRefreshTokens.id, id))
    }

    initializePreferences(userId: number, skillsetsShares: SharedSkillsets) {
        const preferences = Object.fromEntries(codes.map((key) => [key, 0])) as Record<
            Skillset,
            number
        >

        for (const { skillset, share } of skillsetsShares) {
            preferences[skillset] = share
        }

        return this.db
            .insert(userPreferences)
            .values({ userId: userId, ...preferences })
            .onConflictDoUpdate({
                target: userPreferences.userId,
                set: {
                    ...preferences,
                },
            })
    }

    initializeFatigue(userId: number, defaultValue: number) {
        const preferences = Object.fromEntries(codes.map((key) => [key, defaultValue])) as Record<
            Skillset,
            number
        >

        return this.db
            .insert(userFatigue)
            .values({ userId: userId, ...preferences })
            .onConflictDoUpdate({
                target: userFatigue.userId,
                set: {
                    ...preferences,
                },
            })
    }

    getPreferences(userId: number) {
        return this.db
            .select({
                jumps: userPreferences.jumps,
                streams: userPreferences.streams,
                fingerControl: userPreferences.fingerControl,
                tech: userPreferences.tech,
                alternate: userPreferences.alternate,
                gimmick: userPreferences.gimmick,
            })
            .from(userPreferences)
            .where(eq(userPreferences.userId, userId))
    }

    getFatigue(userId: number) {
        return this.db
            .select({
                jumps: userFatigue.jumps,
                streams: userFatigue.streams,
                fingerControl: userFatigue.fingerControl,
                tech: userFatigue.tech,
                alternate: userFatigue.alternate,
                gimmick: userFatigue.gimmick,
            })
            .from(userFatigue)
            .where(eq(userFatigue.userId, userId))
    }

    private getUserDBValues(user: OsuUserExtracted) {
        return {
            name: user.username,
            avatarUrl: user.avatar_url,
            pp: Math.floor(user.pp),
            country: user.country,
        }
    }

    private getUserTokensDBValues(data: OsuAuthToken) {
        const expiresAt = new Date(Date.now() + data.expiresIn * 1000)

        return {
            accessToken: data.token,
            refreshToken: data.refreshToken,
            expiresAt: expiresAt,
        }
    }
}

export default UserRepository
