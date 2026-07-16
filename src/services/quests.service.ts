import questsCategories from '@/config/quests-categories-seed'
import type { QuestModel } from '@/models/quest.model'
import type { BeatmapsModel } from '@/models/beatmaps.model'
import type { MapsetBeatmap } from '@/db/schemas/schema'
import type { UserPreferences } from '@/facades/quests.facade'
import { skillsetsSeed } from '@/config/skillsets-seed'

type Beatmaps = Awaited<ReturnType<QuestModel['getRandomBeatmapSkillsets']>>

type Skillset = (typeof skillsetsSeed)[number]['code']

type BeatmapSkillsets = Awaited<ReturnType<QuestModel['getRandomBeatmapSkillsets']>>[number]
type BeatmapsSkillsets = BeatmapSkillsets[]

type BeatmapWithSkillsets = MapsetBeatmap & {
    dominantSkillsets: Skillset[]
}

type SkillsetStat = {
    skillset: Skillset
    value: number
    percentage: number
}

const skillsets = skillsetsSeed.map((s) => s.code) as readonly Skillset[]

export default (questsModel: QuestModel, beatmapsModel: BeatmapsModel) => ({
    async getUserQuests(userId: number, userPreferences: UserPreferences) {
        const beatmaps = await beatmapsModel.getRandomBeatmaps(10)

        const beatmapsWithSkillsets = await Promise.all(
            beatmaps.map((beatmap) => this.addDominantSkillsets(beatmap)),
        )

        console.log(beatmapsWithSkillsets)
    },

    async addDominantSkillsets(beatmap: MapsetBeatmap): Promise<BeatmapWithSkillsets> {
        const beatmapSkillsets = await beatmapsModel.getBeatmapSkillsets(beatmap.id)
        const beatmapDominantSkillsets: Skillset[] = []

        beatmapSkillsets.forEach((beatmapSkillset) => {
            this.getDominantSkillsets(beatmapSkillset).forEach((dominantSkillset) => {
                beatmapDominantSkillsets.push(dominantSkillset)
            })
        })

        return {
            ...beatmap,
            dominantSkillsets: beatmapDominantSkillsets,
        }
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
