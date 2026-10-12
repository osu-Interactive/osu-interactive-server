import UserService from './user.service'
import UserRepository from './user.repository'

import type { DB } from '@/shared/types/db.types'

export default (db: DB) => {
    const repository = new UserRepository(db)

    return {
        repository: repository,
        service: new UserService(repository),
        RepositoryClass: UserRepository,
        ServiceClass: UserService,
    }
}
