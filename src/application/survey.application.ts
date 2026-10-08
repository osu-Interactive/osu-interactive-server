import SurveyService from '@/services/survey.service'
import UserService from '@/services/user.service'
import type { FastifyInstance } from 'fastify'
import type { SurveyClientData } from '@/routes/survey.routes'

class SurveyApplication {
    constructor(private readonly app: FastifyInstance) {}

    async saveSurvey(userId: number, surveyResult: SurveyClientData) {
        await this.app.db.transaction(async (tx) => {
            const surveyService = new SurveyService(
                this.app.models.factories.survey(tx),
                this.app.models.factories.tags(tx),
            )
            const userService = new UserService(this.app.models.factories.user(tx))

            await userService.initializePreferences(userId, surveyResult)
            await userService.initializeFatigue(userId)
            await surveyService.save(userId, surveyResult, this.app.models.factories.survey, { tx })
        })
    }
}

export default SurveyApplication
