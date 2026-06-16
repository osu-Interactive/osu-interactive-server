import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'

export default async function userRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: authMiddleware }, async (req) => {
        const user = await app.models.user.requireById(req.user.userId)

        return {
            name: user.name,
            osu_id: user.osu_id,
            avatar_url: user.avatar_url,
            pp: user.pp,
            country: user.country,
        }
    })
}
