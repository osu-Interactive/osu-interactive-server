import type { DB } from "../types/drizzle-pg-db"
import { userModel } from "./user"

export function buildModels(db: DB) {
    return {
        user: userModel(db),
    }
}
