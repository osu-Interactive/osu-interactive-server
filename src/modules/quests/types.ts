import type QuestsRepository from './quests.repository'

export type Beatmaps = Awaited<ReturnType<QuestsRepository['getBeatmapsByDominatedSkillsets']>>
export type Beatmap = NonNullable<Beatmaps[number]>
