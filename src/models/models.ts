import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import { userModel } from './user.model'
import { questsModel } from '@/models/quest.model'
import { beatmapsModel } from './beatmaps.model'
import { calculatedBeatmapsModel } from '@/models/calculated-beatmaps.model'
import { surveyModel } from '@/models/survey.model'
import { tagsModel } from '@/models/tags.model'

export type Models = ReturnType<typeof buildModels>

export const modelFactories = {
    user: userModel,
    quests: questsModel,
    beatmap: beatmapsModel,
    calculatedBeatmap: calculatedBeatmapsModel,
    tags: tagsModel,
    survey: surveyModel,
}

export function buildModels(db: DBExecutor) {
    const models = Object.fromEntries(
        Object.entries(modelFactories).map(([key, factory]) => [key, factory(db)]),
    ) as {
        [K in keyof typeof modelFactories]: ReturnType<(typeof modelFactories)[K]>
    }

    return {
        ...models,
        factories: modelFactories,
    }
}
