import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'
import SurveyService from '@/services/survey.service'
import UserService from '@/services/user.service'
import TagsService from '@/services/tags.service'
import SurveyApplication from '@/application/survey.application'
import type { SurveyResult } from '@/types/survey.types'

export default async function surveyRoutes(app: FastifyInstance) {
    const surveyService = SurveyService(app.db, app.models.factories.survey, app.models.tags)
    const userService = UserService(app.models.user)
    const tagsService = TagsService(app.models.tags)
    const surveyApplication = SurveyApplication(userService, surveyService)

    app.get('/', async () => {
        return {
            skillsets: await tagsService.getSkillsets(),
            mods: await tagsService.getMods(),
        }
    })

    app.post('/save', { preHandler: authMiddleware }, async (request, _) => {
        //TODO: Validate client data
        const surveyData = request.body as SurveyResult

        const userId = request.user.id

        await surveyApplication.saveSurvey(userId, surveyData)
    })
}
