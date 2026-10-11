import QuestsService from './quests.service'
import { questsModel } from './quests.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = questsModel(db)

    return {
        repository: repository,
        service: new QuestsService(repository),
        createRepository: questsModel,
        createService: QuestsService,
    }
}
