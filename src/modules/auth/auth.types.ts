import '@fastify/jwt'

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            id: number
            osuId: number
            tokenId?: string
        }
        user: {
            id: number
            osuId: number
        }
    }
}

export type OsuAuthToken = {
    token: string
    expiresIn: number
    refreshToken: string
}

export type OsuCodeGrantTokenResponse = {
    access_token: string
    expires_in: number
    refresh_token: string
    token_type: string
}

export type OsuCredentialTokenResponse = {
    access_token: string
    expires_in: number
    token_type: string
}
