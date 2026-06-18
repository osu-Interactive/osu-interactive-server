import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'

export default async function userRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: authMiddleware }, async (req) => {
        const user = await app.models.user.requireById(req.user.userId)

        return {
            name: user.name,
            osuId: user.osuId,
            avatarUrl: user.avatarUrl,
            pp: user.pp,
            country: user.country,
        }
    })
}
