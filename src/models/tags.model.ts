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
        return db
            .insert(mods)
            .values(values)
            .onConflictDoUpdate({
                target: mods.code,
                set: {
                    name: sql.raw(`excluded.name`),
                },
            })
    },

    async replaceSkillsets(values: { name: string; code: string; surveyDescription: string }[]) {
        return db
            .insert(skillsets)
            .values(values)
            .onConflictDoUpdate({
                target: mods.code,
                set: {
                    name: sql.raw(`excluded.name`),
                    surveyDescription: sql.raw(`excluded.survey_description`),
                },
            })
    },
})
