import { DBExecutor } from '@/types/drizzle-pg-db.types'
import { questCategories } from '@/db/schemas/schema'
import type { QuestCategory } from '@/types/osu.types'
import { sql } from 'drizzle-orm'

export type QuestModel = ReturnType<typeof questsModel>

export const questsModel = (db: DBExecutor) => ({
    async setQuestsCategories(categories: QuestCategory[]) {
        return db
            .insert(questCategories)
            .values(categories)
            .onConflictDoUpdate({
                target: questCategories.code,
                set: {
                    name: sql.raw(`excluded.name`),
                    minPP: sql.raw(`excluded.min_pp`),
                    maxPP: sql.raw(`excluded.max_pp`),
                },
            })
    },
})
