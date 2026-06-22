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
