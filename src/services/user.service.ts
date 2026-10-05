import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'
import type { UserModel } from '@/models/user.model'
import { SurveyResult } from '@/types/survey.types'
import FatigueService from '@/services/private/quests/fatigue.service'
import BudgetHelperService from '@/services/private/quests/budget-helper.service'
import questConfig from '@/config/quests.config'
import questsConfig from '@/config/quests.config'
import { AppError } from '@/errors/app-error'

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
            const preferences = (await userModel.getPreferences(userId))[0]

            if (!preferences) {
                throw new AppError('Unable to get user preferences', {
                    code: 'UNDEFINED_USER_PREFERENCES',
                })
            }

            return preferences
        },

        forwardOrRerollSkillset(userId: number, skillset: Skillset) {
            return fatigueService.rerollSkillset(userId, skillset)
        }
    }
}

export default createUserService
