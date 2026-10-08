import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'
import FatigueService from '@/services/private/quests/fatigue.service'
import BudgetHelperService from '@/services/private/quests/budget-helper.service'
import questConfig from '@/config/quests.config'
import questsConfig from '@/config/quests.config'
import { AppError } from '@/errors/app-error'
import type { UserModel } from '@/models/user.model'
import type { SurveyClientData } from '@/routes/survey.routes'

class UserService {
    private readonly fatigueService: FatigueService
    private readonly budgetHelperService = new BudgetHelperService()

    constructor(private readonly userModel: UserModel) {
        this.fatigueService = new FatigueService(userModel)
    }

    async initializePreferences(userId: number, surveyResult: SurveyClientData) {
        const skillsets: Skillset[] = skillsetsSeed.map(({ code }) => code)

        const sharedSkillsets = this.budgetHelperService.distributeBudgetByPriority(
            skillsets,
            questConfig.preferenceBudget,
            surveyResult.skillsetsCodes,
        )

        console.log(sharedSkillsets)
        await this.userModel.initializePreferences(userId, sharedSkillsets)
    }

    async initializeFatigue(userId: number) {
        await this.userModel.initializeFatigue(userId, questsConfig.defaultUserFatigue)
    }

    async getUserPreferences(userId: number) {
        const preferences = (await this.userModel.getPreferences(userId))[0]

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
