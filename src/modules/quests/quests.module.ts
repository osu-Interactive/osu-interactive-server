import QuestsService from './quests.service'
import QuestsRepository from './quests.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = new QuestsRepository(db)

    return {
        repository: repository,
        service: new QuestsService(repository),
        createRepository: QuestsRepository,
        createService: QuestsService,
    }
}
