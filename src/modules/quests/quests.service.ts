import questsCategories, { type Category } from '@/config/seeds/quests-categories-seed'
import questConfig from '@/config/quests.config'
import SkillsetGenerator from '@/modules/quests/private/quests-generation/skillset-generator'
import { average } from '@/utils/math'

import type QuestsRepository from '@/modules/quests/quests.repository'
import type {
    QuestBeatmap,
    UserSkillsetsPreferences,
    ForwardOrRerollSkillsetFunc,
} from './quests.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'

type BeatmapId = QuestBeatmap['beatmapId']

type GetBMComboDifficulty = (
    beatmapId: number,
    targetPP: number,
) => Promise<{
    combo: number
}>

class QuestsService {
    private readonly skillsetGenerator = new SkillsetGenerator()

    constructor(private readonly questsRepository: QuestsRepository) {}

    async generateUserQuests(
        beatmaps: { Skillset: BeatmapId }[],
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

            const quest = await this.generateQuest(
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

    async generateQuest(
        beatmapId: BeatmapId,
        category: Category,
        getBMComboDifficulty: GetBMComboDifficulty,
        excludedBeatmapIds: number[] = [],
    ) {
        const combo = await getBMComboDifficulty(
            beatmapId,
            this.getQuestCategoryAveragePP(category),
        )

        excludedBeatmapIds.push(beatmapId)

        return { id: beatmapId, combo }
    }

    async getQuestsBeatmaps(
        userId: number,
        userPreferences: UserSkillsetsPreferences,
        amount: number,
        maxQuestsPP: number,
        forwardOrRerollSkillset: ForwardOrRerollSkillsetFunc,
        category: Category,
    ) {
        const skillsets: Skillset[] = []

        for (let i = 0; i < amount; i++) {
            const skillset = await this.skillsetGenerator.getSkillset(
                userId,
                userPreferences,
                forwardOrRerollSkillset,
            )

            skillsets.push(skillset)
        }

        const beatmaps = await this.getBeatmaps(skillsets, maxQuestsPP, category, [])
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

        return res as { Skillset: QuestBeatmap }[]
    }

    async getBeatmaps(
        skillsets: Skillset[],
        maxQuestsPP: number,
        category: Category,
        excludeBeatmapIds: number[],
    ) {
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

        return await this.questsRepository.getBeatmapsByDominatedSkillsets(
            skillsets,
            maxQuestsPP,
            skillsetDifficultyRange,
            minCombo,
            excludeBeatmapIds,
        )
    }

    async initQuestsCategories() {
        await this.questsRepository.setQuestsCategories(questsCategories)
    }

    saveUserQuests(userId: number, beatmapIds: number[], categoryId: number) {
        const expiresAt = new Date(Date.now() + questConfig.lifetime * 1000)
        return this.questsRepository.setUserQuests(userId, beatmapIds, categoryId, expiresAt)
    }

    getDominativeSkillsetRangeDifficulty(categoryMinPP: number, categoryMaxPP: number) {
        const averagePP = average(categoryMinPP, categoryMaxPP)
        const roundedPP = Math.round(averagePP / 1000) * 1000
        const thousands = Math.floor(roundedPP / 1000)

        const coefficient = 1 + (thousands - 1) * 0.1

        return 10 * thousands * coefficient
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

        if (questCategory.maxPP === null) {
            // TODO: Decide what to do with the highest quest category
        }

        const averagePP = average(questCategory.minPP / 20, (questCategory.maxPP ?? 20000) / 20)

        return averagePP * (1 - ppReduction / 100)
    }
}

export default QuestsService
