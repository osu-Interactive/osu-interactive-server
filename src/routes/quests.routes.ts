import { FastifyInstance } from 'fastify'
import { evaluateQuestsCompletion } from '@/services/quest-completion.service'
import { authMiddleware } from '@/middlewares/auth.middleware'

import QuestsService from '@/services/quests.service'
import SurveyService from '@/services/survey.service'
import QuestsFacade from '@/facades/quests.facade'

export default async function questsRoutes(app: FastifyInstance) {
    const questService = QuestsService(app.models.quests)
    const surveyService = new SurveyService(app.db)

    app.get('/:id/evaluate', async (_, reply) => {
        await evaluateQuestsCompletion()
    })

    app.post('/', { preHandler: authMiddleware }, async (req) => {
        const questsFacade = QuestsFacade(questService, surveyService)
        await questsFacade.getUserQuests(req.user.id)
    })
}
