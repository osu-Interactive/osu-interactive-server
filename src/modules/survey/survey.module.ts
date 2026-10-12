import SurveyService from './survey.service'
import SurveyRepository from './survey.repository'
import TagsRepository from '@/modules/tags/tags.repository'

import type { DB } from '@/shared/types/db.types'

export default (db: DB) => {
    const repository = new SurveyRepository(db)
    const tagsRepository = new TagsRepository(db)

    return {
        repository: repository,
        service: new SurveyService(repository, tagsRepository),
        RepositoryClass: SurveyRepository,
        ServiceClass: SurveyService,
    }
}
