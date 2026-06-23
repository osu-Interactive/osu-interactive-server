import { QuestsService, SurveyService } from '@/types/services.types'

export default (questsService: QuestsService, surveyService: SurveyService) => ({
    getUserQuests: async (userId: number) => {
        const userPreferences = await surveyService.getUserFavoriteSkillsets(userId)
        questsService.getUserQuests(userId, userPreferences)
    }
})
