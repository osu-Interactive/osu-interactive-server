import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { usersRefreshTokens } from '../db/schemas/users-refresh-tokens.schema'
import { FastifyInstance } from 'fastify'

type RefreshTokenPayload = {
    userId: number
    osuId: number
    tokenId: string
}

export class AuthTokensService {
    private app: FastifyInstance

    public accessTokenTtlSeconds = 60 * 15
    public refreshTokenTtlSeconds = 60 * 60 * 24 * 14

    constructor(app: FastifyInstance) {
        this.app = app
    }

    async getJwtAndRefreshToken(userId: number, userOsuId: number) {
        const accessToken = this.signAccessToken(userId, userOsuId)

        const tokenId = crypto.randomUUID()
        const refreshToken = this.signRefreshToken(userId, userOsuId, tokenId)
        const refreshTokenHash = await this.hashToken(refreshToken)

        await this.saveRefreshToken(userId, tokenId, refreshTokenHash)

        return {
            accessToken,
            refreshToken,
        }
    }

    signAccessToken(userId: number, userOsuId: number): string {
        return this.app.jwt.sign(
            { userId, osuId: userOsuId },
            { expiresIn: this.accessTokenTtlSeconds },
        )
    }

    signRefreshToken(userId: number, userOsuId: number, tokenId: string): string {
        return this.app.jwt.sign(
            { userId, osuId: userOsuId, tokenId },
            { expiresIn: this.refreshTokenTtlSeconds },
        )
    }

    async hashToken(token: string): Promise<string> {
        return bcrypt.hash(token, 10)
    }

    async saveRefreshToken(userId: number, tokenId: string, tokenHash: string): Promise<void> {
        const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000)

        await this.app.db.insert(usersRefreshTokens).values({
            user_id: userId,
            token_id: tokenId,
            token_hash: tokenHash,
            expires_at: expiresAt,
        })
    }

    async refreshTokens(currentRefreshToken: string) {
        const payload = this.app.jwt.verify<RefreshTokenPayload>(currentRefreshToken)

        const tokenRow = await this.app.db.query.usersRefreshTokens.findFirst({
            where: (tokens, { and, eq, isNull, gt }) =>
                and(
                    eq(tokens.user_id, payload.userId),
                    eq(tokens.token_id, payload.tokenId),
                    isNull(tokens.revoked_at),
                    gt(tokens.expires_at, new Date()),
                ),
        })

        if (!tokenRow) {
            throw new Error('Refresh token not found')
        }

        const isValid = await bcrypt.compare(currentRefreshToken, tokenRow.token_hash)

        if (!isValid) {
            throw new Error('Invalid refresh token')
        }

        await this.app.db
            .update(usersRefreshTokens)
            .set({ revoked_at: new Date() })
            .where(eq(usersRefreshTokens.id, tokenRow.id))

        return this.getJwtAndRefreshToken(payload.userId, payload.osuId)
    }
}
