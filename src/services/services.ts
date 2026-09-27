import AuthService from '@/services/auth.service'
import UserService from '@/services/user.service'
import QuestsService from '@/services/quests.service'
import BeatmapsService from '@/services/beatmaps.service'
import TagsService from '@/services/tags.service'
import SurveyService from '@/services/survey.service'

import type { FastifyInstance } from 'fastify'

type AppModels = FastifyInstance['models']

export type Services = ReturnType<typeof buildServices>

export const serviceFactories = {
    user: UserService,
    quests: QuestsService,
    beatmap: BeatmapsService,
    tags: TagsService,
    survey: SurveyService,

    auth: AuthService,
}

export function buildServices(appModels: AppModels) {
    const services = {
        user: UserService(appModels.user),
        quests: QuestsService(appModels.quests),
        beatmap: BeatmapsService(appModels.beatmap),
        tags: TagsService(appModels.tags),
        survey: SurveyService(appModels.survey, appModels.tags),
    }

    return {
        ...services,
        factories: serviceFactories,
    }
}
