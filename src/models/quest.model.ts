import { DBExecutor } from '@/types/drizzle-pg-db.types'
import { questCategories } from '@/db/schemas/schema'
import type { QuestCategory } from '@/types/osu.types'
import { sql } from 'drizzle-orm'

export type QuestModel = ReturnType<typeof questsModel>

export const questsModel = (db: DBExecutor) => ({
    async setQuestsCategories(categories: QuestCategory[]) {
        await db.execute(sql`TRUNCATE TABLE quest_categories RESTART IDENTITY CASCADE`)

        return db.insert(questCategories).values(categories)
    },
})
