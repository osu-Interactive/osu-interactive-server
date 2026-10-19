import questsCategories, { type Category } from '@/config/seeds/quests-categories-seed'
import questConfig from '@/config/quests.config'
import { average } from '@/utils/math'

import type QuestsRepository from '@/modules/quests/quests.repository'
import type { QuestBeatmap } from './quests.types'
import type { PpBySkillset } from './quests.types'
type BeatmapId = QuestBeatmap['beatmapId']

type GetBMComboDifficulty = (
    beatmapId: number,
    targetPP: number,
) => Promise<{
    combo: number
}>

class QuestsService {
    constructor(private readonly questsRepository: QuestsRepository) {}

    async buildUserQuestsFromBeatmaps(
        beatmaps: PpBySkillset[],
        category: Category,
        getBMComboDifficulty: GetBMComboDifficulty,
    ) {
        const quests = []
        const excludedBeatmapIds: number[] = []

        for (const beatmap of beatmaps) {
            const [skillset, beatmapId] = Object.entries(beatmap)[0]
            if (!beatmapId) {
                throw new Error('Beatmap id is undefined')
            }

            const quest = await this.buildQuest(
                beatmapId,
                category,
                getBMComboDifficulty,
                excludedBeatmapIds,
            )

            if (!quest || !quest.id) {
                throw new Error('Quest generation failed')
            }

            quests.push({ [skillset]: quest.id, combo: quest.combo })
        }

        return quests
    }

    async buildQuest(
        beatmapId: BeatmapId,
        category: Category,
        getBMComboDifficulty: GetBMComboDifficulty,
        excludedBeatmapIds: number[] = [],
    ) {
        const res = await getBMComboDifficulty(beatmapId, this.getQuestCategoryAveragePP(category))

        excludedBeatmapIds.push(beatmapId)

        return { id: beatmapId, combo: res.combo }
    }

    async initQuestsCategories() {
        await this.questsRepository.setQuestsCategories(questsCategories)
    }

    saveUserQuests(userId: number, beatmapIds: number[], categoryId: number) {
        const expiresAt = new Date(Date.now() + questConfig.lifetime * 1000)
        return this.questsRepository.setUserQuests(userId, beatmapIds, categoryId, expiresAt)
    }

    /**
     * Calculates the approximate amount of PP the player is expected to achieve
     * on average for the selected quest category.
     *
     * Takes the average of the category's PP range and divides it by 20.
     * and reduces the result by the configured PP reduction percentage.
     * This represents the approximate PP value of the player's top scores
     * required to reach the target amount of PP.
     *
     * For example, if the player's top scores average around 300 PP,
     * the player would have approximately 6,000 total PP.
     */
    getQuestCategoryAveragePP(questCategory: Category) {
        const ppReduction = questConfig.targetPPReductionPercent
        const averagePP = average(questCategory.minPP / 20, questCategory.maxPP / 20)

        return averagePP * (1 - ppReduction / 100)
    }
}

export default QuestsService
