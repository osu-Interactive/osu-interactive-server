import BeatmapsService from './beatmaps.service'
import BeatmapsRepository from './beatmaps.repository'

import type { DB } from '@/shared/types/db.types'

export default (db: DB) => {
    const repository = new BeatmapsRepository(db)

    return {
        repository: repository,
        service: new BeatmapsService(repository),
        RepositoryClass: BeatmapsRepository,
        ServiceClass: BeatmapsService,
    }
}
