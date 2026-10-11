import TagsService from './tags.service'
import { tagsModel } from './tags.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = tagsModel(db)

    return {
        repository: repository,
        service: new TagsService(repository),
        createRepository: tagsModel,
        createService: TagsService,
    }
}
