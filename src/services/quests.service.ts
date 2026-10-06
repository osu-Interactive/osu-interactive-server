import questsCategories, {
    getQuestCategoryByCode,
    type QuestCategoryCode,
    Category,
} from '@/config/seeds/quests-categories-seed'
import SkillsetGenerator from '@/services/private/quests/skillset-generator'
import questConfig from '@/config/quests.config'
import { average } from '@/utils/math'
import { AppError } from '@/errors/app-error'

import type { QuestModel, Beatmaps as NullableBM } from '@/models/quest.model'
import type { UserSkillsetsPreferences } from '@/types/osu.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'
import type { ForwardOrRerollSkillsetFunc } from '@/services/private/quests/fatigue.service'

type Beatmap = NonNullable<NullableBM[number]>

export type QuestsService = ReturnType<typeof createQuestsService>

type GetBMComboDifficulty = (
    beatmapId: number,
    targetPP: number,
) => Promise<{
    combo: number
}>

const createQuestsService = (
    questsModel: QuestModel,
) => {
    const skillsetGenerator = SkillsetGenerator()

    return {
        async generateUserQuests(
            beatmaps: { Skillset: Beatmap }[],
            category: Category,
            getBMComboDifficulty: GetBMComboDifficulty,
        ) {
            const quests = []
            const excludedBeatmapIds: number[] = []

            for (const beatmap of beatmaps) {
                const [skillset, beatmapBody] = Object.entries(beatmap)[0]
                if (!beatmapBody) {
                    throw new Error('Beatmap body is undefined')
                }

                const quest = await this.generateQuest(
                    beatmapBody,
                    skillset as Skillset,
                    excludedBeatmapIds,
                    category,
                    getBMComboDifficulty,
                )

                if (!quest || !quest.id) {
                    throw new Error('Quest generation failed')
                }

                quests.push({ [skillset]: quest.id, combo: quest.combo })
            }

            return quests
        },

        async generateQuest(
            beatmap: Beatmap,
            skillset: Skillset,
            excludedBeatmapIds: number[],
            category: NonNullable<ReturnType<typeof getQuestCategoryByCode>>,
            getBMComboDifficulty: GetBMComboDifficulty,
        ) {
            let currentBeatmapId = beatmap.beatmapId

            while (true) {
                try {
                    const combo = await getBMComboDifficulty(currentBeatmapId, this.getQuestCategoryAveragePP(category))
                    excludedBeatmapIds.push(currentBeatmapId)

                    return { id: currentBeatmapId, combo }
                } catch (error) {
                    const newBeatmap = await this.findReplacementBeatmap(
                        error,
                        skillset,
                        category,
                        [...excludedBeatmapIds],
                    )

                    excludedBeatmapIds.push(currentBeatmapId)

                    if (!newBeatmap) {
                        console.log(`Didn't find replacement beatmap for skillset: ${skillset}`)
                        break
                    }

                    currentBeatmapId = newBeatmap.beatmapId
                }
            }
        },

        async getQuestsBeatmaps(
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
                const skillset = await skillsetGenerator.getSkillset(
                    userId,
                    userPreferences,
                    forwardOrRerollSkillset,
                )

                skillsets.push(skillset)
            }

            const beatmaps = await this.getBeatmaps(skillsets, category, [])
            const res = []

            let iteration = 0
            for (const skillset of skillsets) {
                iteration++
                const beatmap = beatmaps[iteration - 1] ?? null
                if (beatmap && beatmap.dominantSkillset !== skillset) {
                    throw new Error('Beatmap dominant skillset does not match skillset')
                }
                res.push({ [skillset]: beatmap })
            }

            return res as { Skillset: Beatmap }[]
        },

        async findReplacementBeatmap(
            error: unknown,
            skillset: Skillset,
            category: Category,
            excludedBeatmapIds: number[],
        ) {
            if (!(error instanceof AppError) || error.code !== 'BEATMAP_PP_TOO_LOW') {
                throw error
            }

            const newBeatmaps = await this.getBeatmaps(
                [skillset as Skillset],
                category,
                excludedBeatmapIds,
            )

            return newBeatmaps[0]
        },

        async getBeatmaps(skillsets: Skillset[], category: Category, excludeBeatmapIds: number[]) {
            //TODO: Decide what to do with highest quests category

            const averageSkillsetDifficulty = this.getDominativeSkillsetRangeDifficulty(
                category.minPP,
                category.maxPP ?? 20000,
            )

            const skillsetDifficultyRange = [
                Math.max(0, averageSkillsetDifficulty - 20),
                Math.min(100, averageSkillsetDifficulty + 20),
            ] satisfies [number, number]

            const minCombo = 100

            return await questsModel.getBeatmapsByDominatedSkillsets(
                skillsets,
                skillsetDifficultyRange,
                minCombo,
                excludeBeatmapIds,
            )
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

        /**
         * Calculates the approximate amount of PP the player is expected to achieve
         * on average for the selected quest category.
         *
         * Takes the average of the category's PP range and divides it by 20.
         * This represents the approximate PP value of the player's top scores
         * required to reach the target amount of PP.
         *
         * For example, if the player's top scores average around 300 PP,
         * the player would have approximately 6,000 total PP.
         */
        getQuestCategoryAveragePP(questCategory: Category) {
            if (questCategory.maxPP === null) {
                //TODO: Decide what to do with highest quests category
            }
            return average(questCategory.minPP / 20, (questCategory.maxPP ?? 20000) / 20)
        },
    }
}

export default createQuestsService
