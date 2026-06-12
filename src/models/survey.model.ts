import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import { skillsets, mods, usersMods, usersSkillsets } from '@/db/schemas/schema'
import { eq } from 'drizzle-orm'

export const surveyModel = (db: DBExecutor) => ({
    getAllSkillsets() {
        return db.select().from(skillsets)
    },

    getAllMods() {
        return db.select().from(mods)
    },

    deleteAllUserMods(userId: number) {
        return db.delete(usersMods).where(eq(usersMods.userId, userId))
    },

    deleteAllUserSkillsets(userId: number) {
        return db.delete(usersSkillsets).where(eq(usersSkillsets.userId, userId))
    },

    insertUserSkillsets(values: { userId: number; skillsetId: number }[]) {
        return db.insert(usersSkillsets).values(values)
    },

    insertUserMods(values: { userId: number; modId: number }[]) {
        return db.insert(usersMods).values(values)
    }
})
