import '@fastify/jwt'

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            userId: number
            osuId: number
        }
        user: {
            userId: number
            osuId: number
        }
    }
}
