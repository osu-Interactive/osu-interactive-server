import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

import authRoutes from '../modules/auth/auth.routes'
import userRoutes from '../modules/user/user.routes'
import surveyRoutes from '../modules/survey/survey.routes'
import questsRoutes from '../modules/quests/quests.routes'

const routes: FastifyPluginAsync = async (app) => {
    app.get('/', async () => ({ hello: 'world' }))

    app.register(authRoutes, { prefix: '/auth' })
    app.register(userRoutes, { prefix: '/user' })
    app.register(surveyRoutes, { prefix: '/survey' })
    app.register(questsRoutes, { prefix: '/quests' })
}

export default fp(routes)
