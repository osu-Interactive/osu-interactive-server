import { pickFields } from '@/utils/object'

import type { OsuRecentScores } from '@/types/api-responses/user-recent-scores.types'

const availableScoreFields = [
    'accuracy',
    'max_combo',
    'mode',
    'mods',
    'passed',
    'pp',
    'rank',
    'score',
    'statistics',
] as const

type OsuRecentScore = OsuRecentScores[number]

type MappedScore =
    Pick<OsuRecentScore, (typeof availableScoreFields)[number]> & {
    user_id: number
    beatmap_id: number
}

export function mapScores(scores: OsuRecentScores): MappedScore[] {
    return scores.map((score) => {
        const { user, beatmap } = score

        return {
            ...pickFields(score, availableScoreFields),
            user_id: user.id,
            beatmap_id: beatmap.id,
        }
    })
}
