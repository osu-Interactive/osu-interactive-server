import { FastifyInstance } from 'fastify'
import { evaluateQuestsCompletion } from '@/services/quest-completion.service'
import { authMiddleware } from '@/middlewares/auth.middleware'

import QuestsApplication from '@/application/quests.application'

export default async function questsRoutes(app: FastifyInstance) {
    app.post('/', { preHandler: authMiddleware }, async (req) => {
        const questsApplication = QuestsApplication(app)
        await questsApplication.getUserQuests(req.user.id)
    })

    app.get('/:id/evaluate', async (_, reply) => {
        await evaluateQuestsCompletion()
    })
}
