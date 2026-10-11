import BeatmapsService from './beatmaps.service'
import BeatmapsRepository from './beatmaps.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = new BeatmapsRepository(db)

    return {
        repository: repository,
        service: new BeatmapsService(repository),
        createRepository: BeatmapsRepository,
        createService: BeatmapsService,
    }
}
