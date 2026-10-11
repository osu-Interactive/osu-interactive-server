import SurveyService from './survey.service'
import { surveyModel } from './survey.repository'
import { tagsModel } from '@/modules/tags/tags.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = surveyModel(db)
    const tagsRepository = tagsModel(db)

    return {
        repository: repository,
        service: new SurveyService(repository, tagsRepository),
        createRepository: surveyModel,
        createService: SurveyService,
    }
}
