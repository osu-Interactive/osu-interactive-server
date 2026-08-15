import type { DB } from '@/types/drizzle-pg-db.types'
import  { SurveyModelFactory } from '@/models/survey.model'
import { AppError } from '@/errors/app-error'

export type SurveyService = ReturnType<typeof createSurveyService>

type SurveyResult = {
    skillsetsIds: number[]
    modsIds: number[]
}

const createSurveyService = (db: DB, surveyModelFactory: SurveyModelFactory) => {
    const surveyModel = surveyModelFactory(db)
    return {
        async save(userId: number, survey: SurveyResult) {
            const errors: Record<string, string> = {}

            if (!Array.isArray(survey?.skillsetsIds)) {
                errors.skillsets = 'skillsetsIds must be an array'
            }

            if (!Array.isArray(survey?.modsIds)) {
                errors.mods = 'modsIds must be an array'
            }

            if (Object.keys(errors).length > 0) {
                throw AppError.validationError(errors)
            }

            return db.transaction(async (tx) => {
                const surveyModel = surveyModelFactory(tx)

                await surveyModel.deleteAllUserSkillsets(userId)
                await surveyModel.deleteAllUserMods(userId)

                if (survey.modsIds.length > 0) {
                    const userMods = survey.modsIds.map((modId) => ({
                        userId,
                        modId,
                    }))

                    await surveyModel.insertUserMods(userMods)
                }

                if (survey.skillsetsIds.length > 0) {
                    const userSkillsets = survey.skillsetsIds.map((skillsetId) => ({
                        userId,
                        skillsetId,
                    }))

                    await surveyModel.insertUserSkillsets(userSkillsets)
                }
            })
        },

        getUserFavoriteSkillsets (userId: number) {
            return surveyModel.getUserSkillsets(userId)
        },

        getUserFavoriteMods (userId: number) {
            return surveyModel.getUserMods(userId)
        },
    }
}

export default createSurveyService
