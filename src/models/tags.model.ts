import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import { mods, skillsets } from '@/db/schemas/schema'
import { sql, inArray } from 'drizzle-orm'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type TagsModel = ReturnType<typeof tagsModel>

export const tagsModel = (db: DBExecutor) => ({
    getMods() {
        return db.select().from(mods)
    },

    getSkillsets() {
        return db.select().from(skillsets)
    },

    getSkillsetsByCodes(codes: Skillset[]) {
        return db.select().from(skillsets).where(inArray(skillsets.code, codes))
    },

    getModsByCodes(codes: string[]) {
        return db.select().from(mods).where(inArray(mods.code, codes))
    },

    replaceMods(values: { name: string; code: string }[]) {
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

    replaceSkillsets(values: { name: string; code: string; surveyDescription: string }[]) {
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
