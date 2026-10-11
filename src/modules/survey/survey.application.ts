import SurveyService from '@/modules/survey/survey.service'
import UserService from '@/modules/user/user.service'
import type { SurveyClientData } from '@/modules/survey/survey.routes'
import type { FastifyInstance } from 'fastify'

class SurveyApplication {
    constructor(private readonly app: FastifyInstance) {}

    async saveSurvey(userId: number, surveyResult: SurveyClientData) {
        await this.app.db.transaction(async (tx) => {
            const surveyService = new SurveyService(
                new this.app.modules.survey.createRepository(tx),
                new this.app.modules.tags.createRepository(tx),
            )
            const userRepository = new this.app.modules.user.createRepository(tx)
            const userService = new UserService(userRepository)

            await userService.initializePreferences(userId, surveyResult)
            await userService.initializeFatigue(userId)

            await surveyService.save(
                userId,
                surveyResult,
                this.app.modules.survey.createRepository,
                { tx },
            )
        })
    }
}

export default SurveyApplication
