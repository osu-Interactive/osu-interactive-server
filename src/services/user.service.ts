import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'
import type { UserModel } from '@/models/user.model'
import { SurveyResult } from '@/types/survey.types'
import questConfig from '@/config/quests.config'

export type UserService = ReturnType<typeof createUserService>
export type CreateUserService = typeof createUserService

const createUserService = (userModel: UserModel) => ({
    async initializePreferences(userId: number, surveyResult: SurveyResult) {
        const skillsets: Skillset[] = skillsetsSeed.map(({ code }) => code)

        const sharedSkillsets = this.distributeBudgetByPriority(
            skillsets,
            questConfig.preferenceBudget,
            surveyResult.skillsetsCodes,
        )

        console.log(sharedSkillsets)

        await userModel.initializePreferences(userId, sharedSkillsets)
    },

    async getUserPreferences(userId: number) {
        return (await userModel.getPreferences(userId))[0]
    },

    distributeBudgetByPriority(
        skillsets: Skillset[],
        total: number,
        prioritySkillsets: Skillset[] = [],
    ): { skillset: Skillset; share: number }[] {
        const totalCents = Math.round(total * 100)
        const prioritySet = new Set(prioritySkillsets)

        const weights = skillsets.map((skillset) => (prioritySet.has(skillset) ? 2 : 1))

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

        const shares = weights.map((weight) => Math.floor((totalCents * weight) / totalWeight))

        let remainder = totalCents - shares.reduce((sum, share) => sum + share, 0)

        for (let i = 0; remainder > 0; i++, remainder--) {
            shares[i]++
        }

        return skillsets.map((skillset, index) => ({
            skillset,
            share: shares[index] / 100,
        }))
    },
})

export default createUserService
