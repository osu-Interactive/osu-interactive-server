import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import { usersMods, usersSkillsets, mods, skillsets } from '@/db/schemas/schema'
import { eq } from 'drizzle-orm'

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

    getUserSkillsets(userId: number) {
        return db
            .select({
                id: usersSkillsets.id,
                userId: usersSkillsets.userId,
                skillsetId: usersSkillsets.skillsetId,
                skillsetCode: skillsets.code,
            })
            .from(usersSkillsets)
            .innerJoin(skillsets, eq(usersSkillsets.skillsetId, skillsets.id))
            .where(eq(usersSkillsets.userId, userId))
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
