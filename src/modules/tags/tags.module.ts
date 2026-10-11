import TagsService from './tags.service'
import TagsRepository from './tags.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = new TagsRepository(db)

    return {
        repository: repository,
        service: new TagsService(repository),
        createRepository: TagsRepository,
        createService: TagsService,
    }
}
