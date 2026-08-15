import questsCategories from '@/config/seeds/quests-categories-seed'
import type { QuestModel, BeatmapSkillset } from '@/models/quest.model'
import type { UserPreferences } from '@/facades/quests.facade'
import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'

export type QuestsService = ReturnType<typeof createQuestsService>

type BeatmapsSkillsets = Awaited<ReturnType<QuestModel['getRandomBeatmapSkillsets']>>

type SkillsetStat = {
    skillset: Skillset
    value: number
    percentage: number
}

const skillsets = skillsetsSeed.map((s) => s.code) as readonly Skillset[]

const createQuestsService = (questsModel: QuestModel) => ({
    async getUserQuests(userId: number, userPreferences: UserPreferences) {
        await this.findMatchedBms(['jumps', 'streams'])

        console.log(userPreferences)
        const beatmaps: BeatmapSkillset[] = await questsModel.getRandomBeatmapSkillsets(10)
        const userMatchedBeatmapsSkillsets: BeatmapSkillset[] = []
        beatmaps.forEach((beatmap) => {
            const dominantSkillsets = this.getDominantSkillsets(beatmap)
            userPreferences.skillsets.forEach((skillset) => {
                if (dominantSkillsets.includes(skillset as Skillset)) {
                    userMatchedBeatmapsSkillsets.push(beatmap)
                }
            })
        })
        console.log(userMatchedBeatmapsSkillsets)
    },

    findMatchedBms(neededSkillsets: Skillset[]) {
        return questsModel.getRandomMatchedBM(neededSkillsets)
    },

    getDominantSkillsets(beatmap: BeatmapsSkillsets[number], threshold = 25): Skillset[] {
        const stats = this.getSkillsetStats(beatmap)

        const highest = stats[0].value

        return stats
            .filter(({ value }) => {
                const difference = ((highest - value) / highest) * 100
                return difference <= threshold
            })
            .map(({ skillset }) => skillset)
    },

    getSkillsetStats(beatmap: BeatmapsSkillsets[number]): SkillsetStat[] {
        const stats = skillsets.map((skillset) => ({
            skillset,
            value: beatmap[skillset],
        }))

        stats.sort((a, b) => b.value - a.value)

        return stats.map((item, index) => {
            const next = stats[index + 1]

            return {
                ...item,
                percentage: next
                    ? Number((((item.value - next.value) / next.value) * 100).toFixed(2))
                    : 0,
            }
        })
    },

    generateQuest(userId: number) {},

    getQuestBeatmap(userId: number) {},

    async initQuestsCategories() {
        await questsModel.setQuestsCategories(questsCategories)
    },
})

export default createQuestsService
