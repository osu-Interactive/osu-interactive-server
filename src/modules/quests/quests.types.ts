import type QuestsRepository from './quests.repository'
import type { Skillset } from '@/config/seeds/skillsets-seed'
import type Fatigue from '@/modules/quests/private/quests-generation/fatigue'

export type QuestBeatmaps = Awaited<ReturnType<QuestsRepository['getBeatmapsByDominatedSkillsets']>>
export type QuestBeatmap = NonNullable<QuestBeatmaps[number]>

export type UserSkillsetsPreferences = {
    [key in Skillset]: number
}

export type PpBySkillset = Partial<Record<Skillset, number>>

export type ForwardOrRerollSkillsetFunc = Fatigue['rerollSkillset']
