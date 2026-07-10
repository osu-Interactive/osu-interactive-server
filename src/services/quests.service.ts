import questsCategories from '@/config/quests-categories-seed'
import type { QuestModel } from '@/models/quest.model'
import type { UserPreferences } from '@/facades/quests.facade'

type Beatmaps = Awaited<ReturnType<QuestModel['getRandomBeatmapSkillsets']>>

type Skillset = 'jumps' | 'streams' | 'fingerControl' | 'tech' | 'alt' | 'gimmick'

type SkillsetStat = {
    skillset: Skillset
    value: number
    percentage: number
}

const skillsets: Skillset[] = ['jumps', 'streams', 'fingerControl', 'tech', 'alt', 'gimmick']

export default (questsModel: QuestModel) => ({
    async getUserQuests(userId: number, userPreferences: UserPreferences) {
        console.log(userPreferences)
        const beatmaps = await questsModel.getRandomBeatmapSkillsets(10)
        beatmaps.forEach((beatmap) => {
            const mappedBeatmap = this.getSkillsetStats(beatmap)
            console.log(mappedBeatmap)
            console.log(this.getDominantSkillsets(beatmap))
        })
        //await this.getUserFavoriteSkillsets(userId)
    },

    getSkillsetStats(beatmap: Beatmaps[number]): SkillsetStat[] {
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

    getDominantSkillsets(beatmap: Beatmaps[number], threshold = 25): Skillset[] {
        const stats = this.getSkillsetStats(beatmap)

        const highest = stats[0].value

        return stats
            .filter(({ value }) => {
                const difference = ((highest - value) / highest) * 100
                return difference <= threshold
            })
            .map(({ skillset }) => skillset)
    },

    generateQuest(userId: number) {},

    getQuestBeatmap(userId: number) {},

    async initQuestsCategories() {
        await questsModel.setQuestsCategories(questsCategories)
    },
})
