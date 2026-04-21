import type { DB } from "../types/drizzle-pg-db.types"
import { userModel } from "./user.model"

export function buildModels(db: DB) {
    return {
        user: userModel(db),
    }
}
