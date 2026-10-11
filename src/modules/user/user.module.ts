import UserService from './user.service'
import UserRepository from './user.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = new UserRepository(db)

    return {
        repository: repository,
        service: new UserService(repository),
        createRepository: UserRepository,
        createService: UserService,
    }
}
