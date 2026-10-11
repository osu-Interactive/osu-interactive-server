import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'

export default async function userRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: authMiddleware }, async (req) => {
        const user = await app.modules.user.repository.requireById(req.user.id)

        return {
            name: user.name,
            osuId: user.osuId,
            avatarUrl: user.avatarUrl,
            pp: user.pp,
            country: user.country,
        }
    })
}
