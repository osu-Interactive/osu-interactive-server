import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'
import type { UserModel } from '@/models/user.model'
import { SurveyResult } from '@/types/survey.types'
import FatigueService from '@/services/private/osu/fatigue.service'
import BudgetHelperService from '@/services/private/osu/budget-helper.service'
import questConfig from '@/config/quests.config'
import questsConfig from '@/config/quests.config'

export type UserService = ReturnType<typeof createUserService>
export type CreateUserService = typeof createUserService

const createUserService = (userModel: UserModel) => {
    const fatigueService = FatigueService(userModel)
    const budgetHelperService = BudgetHelperService()

    return {
        async initializePreferences(userId: number, surveyResult: SurveyResult) {
            const skillsets: Skillset[] = skillsetsSeed.map(({ code }) => code)

            const sharedSkillsets = budgetHelperService.distributeBudgetByPriority(
                skillsets,
                questConfig.preferenceBudget,
                surveyResult.skillsetsCodes,
            )

            console.log(sharedSkillsets)
            await userModel.initializePreferences(userId, sharedSkillsets)
        },

        async initializeFatigue(userId: number) {
            await userModel.initializeFatigue(userId, questsConfig.defaultUserFatigue)
        },

        async getUserPreferences(userId: number) {
            return (await userModel.getPreferences(userId))[0]
        },

        forwardOrRerollSkillset(userId: number, skillset: Skillset) {
            return fatigueService.rerollSkillset(userId, skillset)
        }
    }
}

export default createUserService
