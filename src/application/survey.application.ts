import SurveyService from  '@/services/survey.service'
import UserService from '@/services/user.service'
import type { SurveyResult } from '@/types/survey.types'
import type { FastifyInstance } from 'fastify'

export default (app: FastifyInstance) => ({
    saveSurvey: async (userId: number, surveyResult: SurveyResult) => {
        await app.db.transaction(async (tx) => {
            const surveyService = SurveyService(app.models.factories.survey(tx), app.models.factories.tags(tx))
            const userService = UserService(app.models.factories.user(tx))

            await userService.initializePreferences(userId, surveyResult)
            await userService.initializeFatigue(userId)
            await surveyService.save(userId, surveyResult, app.models.factories.survey, { tx })
        })
    }
})
