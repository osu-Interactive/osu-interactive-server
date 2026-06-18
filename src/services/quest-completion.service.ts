import client from '@/infrastructure/osu-api/osu-api-app-client'
import { mapScores } from './private/osu/user-scores-mapper.service'
import type { OsuRecentScores } from '@/types/api-responses/user-recent-scores.types'

export async function evaluateQuestsCompletion() {
    const userScores = await getUserRecentScores()
    console.log(userScores)
    console.log(userScores.length)
    return userScores
}

async function getUserRecentScores(userId: number = 14466638, amount: number = 2) {
    const res = await client.get<OsuRecentScores>(
        `/users/${userId}/scores/recent?include_fails=1&limit=${amount}`,
    )
    return mapScores(res.data)
}
