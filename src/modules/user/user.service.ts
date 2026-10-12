import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'
import Fatigue from '@/modules/quests/private/quests-generation/fatigue'
import BudgetHelper from '@/modules/quests/private/quests-generation/budget-helper'
import questConfig from '@/config/quests.config'
import questsConfig from '@/config/quests.config'
import { AppError } from '@/errors/app-error'
import type UserRepository from '@/modules/user/user.repository'
import type { SurveyClientData } from '@/modules/survey/survey.routes'

class UserService {
    private readonly fatigueService: Fatigue
    private readonly budgetHelperService = new BudgetHelper()

    constructor(private readonly userRepository: UserRepository) {
        this.fatigueService = new Fatigue(userRepository)
    }

    async initializePreferences(userId: number, surveyResult: SurveyClientData) {
        const skillsets: Skillset[] = skillsetsSeed.map(({ code }) => code)

        const sharedSkillsets = this.budgetHelperService.distributeBudgetByPriority(
            skillsets,
            questConfig.preferenceBudget,
            surveyResult.skillsetsCodes,
        )

        console.log(sharedSkillsets)
        await this.userRepository.initializePreferences(userId, sharedSkillsets)
    }

    async initializeFatigue(userId: number) {
        await this.userRepository.initializeFatigue(userId, questsConfig.defaultUserFatigue)
    }

    async getUserPreferences(userId: number) {
        const preferences = (await this.userRepository.getPreferences(userId))[0]

        if (!preferences) {
            throw new AppError('Unable to get user preferences', {
                code: 'UNDEFINED_USER_PREFERENCES',
            })
        }

        return preferences
    }

    forwardOrRerollSkillset = (userId: number, skillset: Skillset) => {
        return this.fatigueService.rerollSkillset(userId, skillset)
    }
}

export default UserService
