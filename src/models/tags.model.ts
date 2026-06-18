import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import { mods, skillsets } from '@/db/schemas/schema'
import { sql } from 'drizzle-orm'

export type TagsModel = ReturnType<typeof tagsModel>

export const tagsModel = (db: DBExecutor) => ({
    getMods() {
        return db.select().from(mods)
    },

    getSkillsets() {
        return db.select().from(skillsets)
    },

    async replaceMods(values: { name: string; code: string }[]) {
        await db.execute(sql`TRUNCATE TABLE mods RESTART IDENTITY CASCADE`)

        await db.insert(mods).values(values)
    },

    async replaceSkillsets(values: { name: string; code: string; surveyDescription: string }[]) {
        await db.execute(sql`TRUNCATE TABLE skillsets RESTART IDENTITY CASCADE`)

        await db.insert(skillsets).values(values)
    },
})
