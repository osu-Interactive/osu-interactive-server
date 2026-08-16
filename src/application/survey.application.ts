import type { SurveyService } from '@/services/survey.service'
import type { UserService } from '@/services/user.service'
import type { SurveyResult } from '@/types/survey.types'

export default (userService: UserService, surveyService: SurveyService) => ({
    saveSurvey: async (userId: number, surveyResult: SurveyResult) => {
        await userService.initializePreferences(userId, surveyResult)
        await surveyService.save(userId, surveyResult)
    }
})
