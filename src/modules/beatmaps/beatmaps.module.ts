import BeatmapsService from './beatmaps.service'
import { beatmapsModel } from './beatmaps.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = beatmapsModel(db)

    return {
        repository: repository,
        service: new BeatmapsService(repository),
        createRepository: beatmapsModel,
        createService: BeatmapsService,
    }
}
