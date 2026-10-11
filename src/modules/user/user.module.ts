import UserService from './user.service'
import { userModel } from './user.repository'

import type { DB } from '@/types/drizzle-pg-db.types'

export default (db: DB) => {
    const repository = userModel(db)

    return {
        repository: repository,
        service: new UserService(repository),
        createRepository: userModel,
        createService: UserService,
    }
}
