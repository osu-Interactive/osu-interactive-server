import DBClient from '../db/db.client'
import { usersMods } from '../db/schemas/users-mods.schema'
import { usersSkillsets } from '../db/schemas/users-skillsets.schema'
import { eq } from 'drizzle-orm'

const db = DBClient.getInstance().db

interface SurveyResult {
    skillsets: number[]
    mods: number[]
}

export async function saveSurveyResult(userId: number, survey: SurveyResult) {
    await db.delete(usersMods).where(eq(usersMods.userId, userId))
    await db.delete(usersSkillsets).where(eq(usersSkillsets.userId, userId))

    if (survey.mods.length > 0) {
        await db.insert(usersMods).values(
            survey.mods.map((modId) => ({
                userId,
                modId,
            })),
        )
    }

    if (survey.skillsets.length > 0) {
        await db.insert(usersSkillsets).values(
            survey.skillsets.map((skillsetId) => ({
                userId,
                skillsetId,
            })),
        )
    }
}
