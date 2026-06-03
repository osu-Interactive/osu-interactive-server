import type { DB } from '@/types/drizzle-pg-db.types'
import { userModel } from './user.model'
import { beatmapsModel } from './beatmaps.model'
import { calculatedBeatmapsModel } from '@/models/calculated-beatmaps.model'
import { surveyModel } from '@/models/survey.model'

export function buildModels(db: DB) {
    return {
        user: userModel(db),
        mapset: beatmapsModel(db),
        calculatedBeatmap: calculatedBeatmapsModel(db),
        survey: surveyModel(db),
    }
}
