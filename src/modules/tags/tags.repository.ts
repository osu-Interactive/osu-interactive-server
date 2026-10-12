import { mods, skillsets } from '@/db/schemas/schema'
import { sql, inArray, eq } from 'drizzle-orm'
import type { DBExecutor } from '@/shared/types/db.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'


class TagsRepository {
    constructor(private readonly db: DBExecutor) {}

    getMods() {
        return this.db.select().from(mods)
    }

    getSkillsets() {
        return this.db.select().from(skillsets)
    }

    getSkillsetsByCodes(codes: Skillset[]) {
        return this.db.select().from(skillsets).where(inArray(skillsets.code, codes))
    }

    getModsByCodes(codes: string[]) {
        return this.db.select().from(mods).where(inArray(mods.code, codes))
    }

    replaceMods(values: { name: string; code: string }[]) {
        return this.db
            .insert(mods)
            .values(values)
            .onConflictDoUpdate({
                target: mods.code,
                set: {
                    name: sql.raw(`excluded.name`),
                },
            })
    }

    replaceSkillsets(values: { name: string; code: string; surveyDescription: string }[]) {
        return this.db
            .insert(skillsets)
            .values(values)
            .onConflictDoUpdate({
                target: mods.code,
                set: {
                    name: sql.raw(`excluded.name`),
                    surveyDescription: sql.raw(`excluded.survey_description`),
                },
            })
    }
}

export default TagsRepository
