import questsCategories, { getQuestCategoryByCode, type QuestCategoryCode } from '@/config/seeds/quests-categories-seed'
import BudgetHelperService from '@/services/private/osu/budget-helper.service'
import questConfig from '@/config/quests.config'
import { average } from '@/utils/math'

import type { QuestModel } from '@/models/quest.model'
import type { UserSkillsetsPreferences } from '@/types/osu.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'
import type { ForwardOrRerollSkillsetFunc } from '@/services/private/osu/fatigue.service'

export type QuestsService = ReturnType<typeof createQuestsService>

type OptionalUserSkillsetsPreferences = Partial<UserSkillsetsPreferences>

const createQuestsService = (questsModel: QuestModel) => {
    const budgetHelperService = BudgetHelperService()

    //TODO: Make sure that ids won't be duplicated'
    return {
        async generateUserQuests(
            userId: number,
            userPreferences: UserSkillsetsPreferences,
            amount: number,
            forwardOrRerollSkillset: ForwardOrRerollSkillsetFunc,
            categoryCode: QuestCategoryCode,
        ) {
            const category = getQuestCategoryByCode(categoryCode)
            if (!category) {
                throw new Error(`Category with code ${categoryCode} not found`)
            }

            const skillsets: Skillset[] = []

            for (let i = 0; i < amount; i++) {
                const skillset = await this.getSkillset(
                    userId,
                    userPreferences,
                    forwardOrRerollSkillset,
                )

                skillsets.push(skillset)
                console.log(`Accepted skillset: ${skillset} for quest ${i + 1}\n`)
            }

            //TODO: Decide what to do with highest quests category

            const averageSkillsetDifficulty = this.getDominativeSkillsetRangeDifficulty(
                category.minPP,
                category.maxPP ?? 20000,
            )

            const skillsetDifficultyRange = [
                Math.max(0, averageSkillsetDifficulty - 20),
                Math.min(100, averageSkillsetDifficulty + 20),
            ] satisfies [number, number]

            const beatmaps = await questsModel.getBeatmapsByDominatedSkillsets(
                skillsets,
                skillsetDifficultyRange,
            )
            return beatmaps.map((beatmap) => beatmap.beatmapId)
        },

        async getSkillset(
            userId: number,
            userPreferences: UserSkillsetsPreferences,
            forwardOrRerollSkillset: ForwardOrRerollSkillsetFunc,
        ) {
            let optionalPreferences: OptionalUserSkillsetsPreferences = userPreferences
            let skillset = this.weightedRandom(userPreferences)
            let reroll = await forwardOrRerollSkillset(userId, skillset)
            let prevPreferencesLength = Object.keys(userPreferences).length

            while (reroll) {
                console.log(`${skillset} was selected, but will be rerolled due to fatigue`)
                const { [skillset]: _, ...preferencesWithoutSkillset } = optionalPreferences

                const preferencesWithoutSkillsetLength = Object.keys(
                    preferencesWithoutSkillset,
                ).length

                if (preferencesWithoutSkillsetLength !== prevPreferencesLength - 1) {
                    throw new Error('Error while discarding skillset from preferences')
                } else if (preferencesWithoutSkillsetLength === 0) {
                    console.warn(
                        'No skillsets left in preferences. Continue with fallback with any random skillset',
                    )
                    skillset = this.weightedRandom(userPreferences)
                    reroll = false
                    continue
                }

                prevPreferencesLength = preferencesWithoutSkillsetLength
                optionalPreferences = budgetHelperService.normalizeTo100(preferencesWithoutSkillset)
                skillset = this.weightedRandom(optionalPreferences)
                reroll = await forwardOrRerollSkillset(userId, skillset)
            }

            return skillset
        },

        weightedRandom<T extends Record<string, number>>(weights: T): keyof T {
            const random = Math.random() * 100
            let cumulative = 0

            for (const [item, chance] of Object.entries(weights)) {
                cumulative += chance

                if (random < cumulative) {
                    return item as keyof T
                }
            }

            throw new Error('Weights must sum to 100')
        },

        async initQuestsCategories() {
            await questsModel.setQuestsCategories(questsCategories)
        },

        saveUserQuests(userId: number, beatmapIds: number[], categoryId: number) {
            const expiresAt = new Date(Date.now() + questConfig.lifetime * 1000)
            return questsModel.setUserQuests(userId, beatmapIds, categoryId, expiresAt)
        },

        getDominativeSkillsetRangeDifficulty(categoryMinPP: number, categoryMaxPP: number) {
            const averagePP = average(categoryMinPP, categoryMaxPP)
            const roundedPP = Math.round(averagePP / 1000) * 1000
            const thousands = Math.floor(roundedPP / 1000)

            const coefficient = 1 + (thousands - 1) * 0.1

            return 10 * thousands * coefficient
        },
    }
}

export default createQuestsService
