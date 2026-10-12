import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../../db/schemas/schema'

export type DB = NodePgDatabase<typeof schema>
export type DBTransaction = Parameters<Parameters<DB['transaction']>[0]>[0]
export type DBExecutor = DB | DBTransaction
export type SaveConnection = { db: DB; tx?: never } | { tx: DBTransaction; db?: never }

import type { UserCountry } from './api-responses/user.types'

export type DBUser = {
    id: number
    osuId: number
    name: string
    avatarUrl: string | null
    pp: number
    country: UserCountry
    createdAt: Date
}
