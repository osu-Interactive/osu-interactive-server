import { eq } from 'drizzle-orm'
import { usersMods, usersSkillsets, mods, skillsets } from '@/db/schemas/schema'
import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type SurveyModelFactory = typeof surveyModel
export type SurveyModel = ReturnType<SurveyModelFactory>

export const surveyModel = (db: DBExecutor) => ({
    getUserMods(userId: number) {
        return db
            .select({
                id: usersMods.id,
                userId: usersMods.userId,
                modId: usersMods.modId,
                modCode: mods.code,
            })
            .from(usersMods)
            .innerJoin(mods, eq(usersMods.modId, mods.id))
            .where(eq(usersMods.userId, userId))
    },

    async getUserSkillsets(userId: number) {
        const result = await db
            .select({
                id: usersSkillsets.id,
                userId: usersSkillsets.userId,
                skillsetId: usersSkillsets.skillsetId,
                skillsetCode: skillsets.code,
            })
            .from(usersSkillsets)
            .innerJoin(skillsets, eq(usersSkillsets.skillsetId, skillsets.id))
            .where(eq(usersSkillsets.userId, userId))

        return result.map((skillset) => ({
            ...skillset,
            skillsetCode: skillset.skillsetCode as Skillset,
        }))
    },

    insertUserSkillsets(values: { userId: number; skillsetId: number }[]) {
        return db.insert(usersSkillsets).values(values)
    },

    insertUserMods(values: { userId: number; modId: number }[]) {
        return db.insert(usersMods).values(values)
    },

    deleteAllUserMods(userId: number) {
        return db.delete(usersMods).where(eq(usersMods.userId, userId))
    },

    deleteAllUserSkillsets(userId: number) {
        return db.delete(usersSkillsets).where(eq(usersSkillsets.userId, userId))
    },
})
