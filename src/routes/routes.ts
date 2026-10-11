import { FastifyInstance } from 'fastify'
import authRoutes from '../modules/auth/auth.routes'
import userRoutes from '../modules/user/user.routes'
import surveyRoutes from '../modules/survey/survey.routes'
import questsRoutes from '../modules/quests/quests.routes'

export default async function routes(app: FastifyInstance) {
    app.get('/', async () => {
        return { hello: 'world' }
    })

    app.register(authRoutes, { prefix: '/auth' })
    app.register(userRoutes, { prefix: '/user' })
    app.register(surveyRoutes, { prefix: '/survey' })
    app.register(questsRoutes, { prefix: '/quests' })
}
