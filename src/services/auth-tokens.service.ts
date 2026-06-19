import crypto from 'crypto'
import bcrypt from 'bcrypt'
import type { UserModel } from '@/models/user.model'
import type { JWT } from '@fastify/jwt'

type RefreshTokenPayload = {
    userId: number
    osuId: number
    tokenId: string
}

export class AuthTokensService {
    public accessTokenTtlSeconds = 60 * 15
    public refreshTokenTtlSeconds = 60 * 60 * 24 * 14

    constructor(private userModel: UserModel, private jwt: JWT) {}

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
        return this.jwt.sign(
            { userId, osuId: userOsuId },
            { expiresIn: this.accessTokenTtlSeconds },
        )
    }

    signRefreshToken(userId: number, userOsuId: number, tokenId: string): string {
        return this.jwt.sign(
            { userId, osuId: userOsuId, tokenId },
            { expiresIn: this.refreshTokenTtlSeconds },
        )
    }

    async hashToken(token: string): Promise<string> {
        return bcrypt.hash(token, 10)
    }

    async saveRefreshToken(userId: number, tokenId: string, tokenHash: string): Promise<void> {
        const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000)

        await this.userModel.setRefreshToken(userId, tokenId, tokenHash, expiresAt)
    }

    async refreshTokens(currentRefreshToken: string) {
        const payload = this.jwt.verify<RefreshTokenPayload>(currentRefreshToken)

        const refreshToken = await this.userModel.getValidRefreshToken(
            payload.userId,
            payload.tokenId,
        )

        if (!refreshToken) {
            throw new Error('Refresh token not found')
        }

        const isValid = await bcrypt.compare(currentRefreshToken, refreshToken.tokenHash)

        if (!isValid) {
            throw new Error('Invalid refresh token')
        }

        await this.userModel.updateRefreshToken(refreshToken.id)

        return this.getJwtAndRefreshToken(payload.userId, payload.osuId)
    }
}
