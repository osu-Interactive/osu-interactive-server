import type { FastifyInstance } from 'fastify'

import UserService from '@/services/user.service'
import QuestsService from '@/services/quests.service'
import BeatmapsService from '@/services/beatmaps.service'
import CalculatedBeatmapsService from '@/services/calculated-beatmaps.service'
import TagsService from '@/services/tags.service'
import SurveyService from '@/services/survey.service'

type AppModels = FastifyInstance['models']

export type Services = ReturnType<typeof buildServices>

export const serviceFactories = {
    user: UserService,
    quests: QuestsService,
    beatmap: BeatmapsService,
    calculatedBeatmap: CalculatedBeatmapsService,
    tags: TagsService,
    survey: SurveyService,
}

export function buildServices(appModels: AppModels) {
    const services = {
        user: UserService(appModels.user),
        quests: QuestsService(appModels.quests),
        beatmap: BeatmapsService(appModels.beatmap),
        calculatedBeatmap: CalculatedBeatmapsService(appModels.calculatedBeatmap),
        tags: TagsService(appModels.tags),
        survey: SurveyService(appModels.survey, appModels.tags),
    }

    return {
        ...services,
        factories: serviceFactories,
    }
}
