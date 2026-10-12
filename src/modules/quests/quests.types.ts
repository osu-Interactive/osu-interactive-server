import type QuestsRepository from './quests.repository'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type Beatmaps = Awaited<ReturnType<QuestsRepository['getBeatmapsByDominatedSkillsets']>>
export type Beatmap = NonNullable<Beatmaps[number]>

export type QuestCategory = {
    code: number
    name: string
    minPP: number
    maxPP: number | null
}

export type UserSkillsetsPreferences = {
    [key in Skillset]: number
}
