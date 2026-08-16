import { FastifyInstance } from 'fastify'
import { evaluateQuestsCompletion } from '@/services/quest-completion.service'
import { authMiddleware } from '@/middlewares/auth.middleware'

import QuestsService from '@/services/quests.service'
import UserQuestsGeneratorService from '@/services/user.service'
import SurveyService from '@/services/survey.service'
import QuestsApplication from '@/application/quests.application'

export default async function questsRoutes(app: FastifyInstance) {
    const questService = QuestsService(app.models.quests)
    const surveyService = SurveyService(app.db, app.models.factories.survey, app.models.tags)
    const userQuestsGeneratorService = UserQuestsGeneratorService(app.models.user)

    app.post('/', { preHandler: authMiddleware }, async (req) => {
        const userId = req.user.id

        const questsApplication = QuestsApplication(questService, surveyService)
        await questsApplication.getUserQuests(req.user.id)
    })

    app.get('/:id/evaluate', async (_, reply) => {
        await evaluateQuestsCompletion()
    })
}
