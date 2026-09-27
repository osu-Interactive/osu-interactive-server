import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { AppError } from '@/errors/app-error'
import type { JWT } from '@fastify/jwt'
import type { UserModel } from '@/models/user.model'

type RefreshTokenPayload = {
    id: number
    osuId: number
    tokenId: string
}

class AuthTokensService {
    public accessTokenTtlSeconds = 60 * 15
    public refreshTokenTtlSeconds = 60 * 60 * 24 * 14

    constructor(protected userModel: UserModel, protected jwt: JWT) {}

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
            { id: userId, osuId: userOsuId },
            { expiresIn: this.accessTokenTtlSeconds },
        )
    }

    signRefreshToken(userId: number, userOsuId: number, tokenId: string): string {
        return this.jwt.sign(
            { id: userId, osuId: userOsuId, tokenId },
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
            payload.id,
            payload.tokenId,
        )

        if (!refreshToken) {
            throw new AppError('Refresh token not found', { code: 'INVALID_REFRESH_TOKEN' })
        }

        const isValid = await bcrypt.compare(currentRefreshToken, refreshToken.tokenHash)

        if (!isValid) {
            throw new AppError('Invalid refresh token', { code: 'INVALID_REFRESH_TOKEN' })
        }

        await this.userModel.updateRefreshToken(refreshToken.id)

        return this.getJwtAndRefreshToken(payload.id, payload.osuId)
    }
}

export default AuthTokensService
