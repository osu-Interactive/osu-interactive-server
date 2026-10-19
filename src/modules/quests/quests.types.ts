import type QuestsRepository from './quests.repository'
import type FatigueCalculator from './private/quests-generation/fatigue-calculator'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type QuestBeatmaps = Awaited<ReturnType<QuestsRepository['getBeatmapsByDominatedSkillsets']>>
export type QuestBeatmap = NonNullable<QuestBeatmaps[number]>

export type UserSkillsetsPreferences = {
    [key in Skillset]: number
}

export type PpBySkillset = Partial<Record<Skillset, number>>

export type ForwardOrRerollSkillsetFunc = FatigueCalculator['shouldRerollSkillset']

export type UserFatigue = { [key in Skillset]: number }
