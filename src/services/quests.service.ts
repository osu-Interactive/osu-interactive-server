import questsCategories from '@/config/seeds/quests-categories-seed'
import type { QuestModel } from '@/models/quest.model'
import type { UserSkillsetsPreferences } from '@/types/osu.types'
import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'

export type QuestsService = ReturnType<typeof createQuestsService>

type SkillsetStat = {
    skillset: Skillset
    value: number
    percentage: number
}

const createQuestsService = (questsModel: QuestModel) => ({
    async getUserQuests(userPreferences: UserSkillsetsPreferences, amount: number) {
        const skillsets: Skillset[] = []

        for (let i = 0; i < amount; i++) {
            skillsets.push(this.weightedRandom(userPreferences))
        }

        const beatmaps = await questsModel.getBeatmapsByDominatedSkillsets(skillsets)

        return beatmaps.map((beatmap) => (beatmap.beatmapId))
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
})

export default createQuestsService
