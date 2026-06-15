import { FastifyInstance } from 'fastify'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import questsRoutes from './quests.routes'

export default async function routes(app: FastifyInstance) {
    app.get('/', async () => {
        return { hello: 'world' }
    })

    app.register(authRoutes, { prefix: '/auth' })
    app.register(userRoutes, { prefix: '/user' })
    app.register(questsRoutes, { prefix: '/quests' })
}
