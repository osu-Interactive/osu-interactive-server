import type { DB } from '@/types/drizzle-pg-db.types'
import { userModel } from "./user.model"
import { mapsetModel } from "./mapset.model"

export function buildModels(db: DB) {
    return {
        user: userModel(db),
        mapset: mapsetModel(db),
    }
}
