import { FastifyInstance } from 'fastify'
import { evaluateQuestsCompletion } from '@/services/quest-completion.service'
import { authMiddleware } from '@/middlewares/auth.middleware'

import QuestsApplication from '@/application/quests.application'

export default async function questsRoutes(app: FastifyInstance) {
    app.post<{ Body: { categoryCode: number } }>('/', { preHandler: authMiddleware }, async (req) => {
        const { categoryCode } = req.body

        const questsApplication = QuestsApplication(app)
        await questsApplication.getUserQuests(req.user.id, categoryCode)
    })

    app.get('/categories', { preHandler: authMiddleware }, async () => {
        return app.models.quests.getQuestsCategories()
    })

    app.get('/:id/evaluate', async (_, reply) => {
        await evaluateQuestsCompletion()
    })
}
