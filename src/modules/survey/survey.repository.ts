import { eq } from 'drizzle-orm'
import { usersMods, usersSkillsets, mods, skillsets } from '@/db/schemas/schema'
import type { DBExecutor } from '@/shared/types/db.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type meow = typeof SurveyRepository

class SurveyRepository {
    constructor(private readonly db: DBExecutor) {}

    getUserMods(userId: number) {
        return this.db
            .select({
                id: usersMods.id,
                userId: usersMods.userId,
                modId: usersMods.modId,
                modCode: mods.code,
            })
            .from(usersMods)
            .innerJoin(mods, eq(usersMods.modId, mods.id))
            .where(eq(usersMods.userId, userId))
    }

    async getUserSkillsets(userId: number) {
        const result = await this.db
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
    }

    insertUserSkillsets(values: { userId: number; skillsetId: number }[]) {
        return this.db.insert(usersSkillsets).values(values)
    }

    insertUserMods(values: { userId: number; modId: number }[]) {
        return this.db.insert(usersMods).values(values)
    }

    deleteAllUserMods(userId: number) {
        return this.db.delete(usersMods).where(eq(usersMods.userId, userId))
    }

    deleteAllUserSkillsets(userId: number) {
        return this.db.delete(usersSkillsets).where(eq(usersSkillsets.userId, userId))
    }
}

export default SurveyRepository
