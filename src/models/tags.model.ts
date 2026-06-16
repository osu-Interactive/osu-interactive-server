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


    async setMods(values: { code: string, name: string }[]) {
        await db.insert(mods).values(values)
            .onConflictDoUpdate({
                target: mods.code,
                set: {
                    name: sql.raw(`excluded.name`),
                },
            })
    },

    async setSkillsets(values: { code: string, name: string, surveyDescription: string }[]) {
        await db.insert(skillsets).values(values)
            .onConflictDoUpdate({
                target: mods.code,
                set: {
                    name: sql.raw(`excluded.name`),
                    surveyDescription: sql.raw(`excluded.survey_description`),
                },
            })
    }
})
