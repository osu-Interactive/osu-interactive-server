import SkillsetGenerator from '@/modules/quests/private/quests-generation/skillset-generator'
import FatigueCalculator from './fatigue-calculator'
import { average } from '@/utils/math'
import type QuestsRepository from '../../quests.repository'
import type { UserFatigue, UserSkillsetsPreferences } from '@/modules/quests/quests.types'
import type { Category } from '@/config/seeds/quests-categories-seed'
import type { Skillset } from '@/config/seeds/skillsets-seed'

class BeatmapsSelector {
    private readonly fatigue = new FatigueCalculator()
    private readonly skillsetGenerator = new SkillsetGenerator()

    constructor(private readonly questsRepository: QuestsRepository) {}

    async selectUserQuestBeatmaps(
        userFatigue: UserFatigue,
        userPreferences: UserSkillsetsPreferences,
        amount: number,
        maxQuestsPP: number,
        category: Category,
    ) {
        const skillsets: Skillset[] = []

        for (let i = 0; i < amount; i++) {
            const skillset = await this.skillsetGenerator.getSkillset(
                userFatigue,
                userPreferences,
                this.fatigue.shouldRerollSkillset,
            )

            skillsets.push(skillset)
        }

        const beatmaps = await this.findMatchingBeatmaps(skillsets, maxQuestsPP, category, [])
        const res = []

        let iteration = 0
        for (const skillset of skillsets) {
            iteration++
            const beatmap = beatmaps[iteration - 1] ?? null
            if (beatmap && beatmap.dominantSkillset !== skillset) {
                throw new Error('Beatmap dominant skillset does not match skillset')
            }
            res.push({ skillset, beatmapBody: beatmap })
        }

        return res
    }

    async findMatchingBeatmaps(
        skillsets: Skillset[],
        maxQuestsPP: number,
        category: Category,
        excludeBeatmapIds: number[],
    ) {
        const averageSkillsetDifficulty = this.calculateTargetSkillsetDifficulty(
            category.minPP,
            category.maxPP,
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

    calculateTargetSkillsetDifficulty(categoryMinPP: number, categoryMaxPP: number) {
        const averagePP = average(categoryMinPP, categoryMaxPP)
        const roundedPP = Math.round(averagePP / 1000) * 1000
        const thousands = Math.floor(roundedPP / 1000)

        const coefficient = 1 + (thousands - 1) * 0.1

        return 10 * thousands * coefficient
    }
}

export default BeatmapsSelector
