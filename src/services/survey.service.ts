import type { DB } from '@/types/drizzle-pg-db.types'
import  { SurveyModelFactory } from '@/models/survey.model'
import { AppError } from '@/errors/app-error'
import type { SurveyResult } from '@/types/survey.types'
import type { TagsModel } from '@/models/tags.model'

export type SurveyService = ReturnType<typeof createSurveyService>

const createSurveyService = (db: DB, surveyModelFactory: SurveyModelFactory, tagsModel: TagsModel) => {
    const surveyModel = surveyModelFactory(db)
    return {
        async save(userId: number, survey: SurveyResult) {
            const errors: Record<string, string> = {}

            if (!Array.isArray(survey?.skillsetsCodes)) {
                errors.skillsets = 'skillsetsCodes must be an array'
            }

            if (!Array.isArray(survey?.modsCodes)) {
                errors.mods = 'modsCodes must be an array'
            }

            if (Object.keys(errors).length > 0) {
                throw AppError.validationError(errors)
            }

            const skillsets = await tagsModel.getSkillsetsByCodes(survey.skillsetsCodes)
            const mods = await tagsModel.getModsByCodes(survey.modsCodes)

            const skillsetIds = skillsets.map((x) => x.id)
            const modIds = mods.map((x) => x.id)

            return db.transaction(async (tx) => {
                const surveyModel = surveyModelFactory(tx)

                await surveyModel.deleteAllUserSkillsets(userId)
                await surveyModel.deleteAllUserMods(userId)

                if (skillsetIds.length > 0) {
                    const userSkillsets = skillsetIds.map((skillsetId) => ({
                        userId,
                        skillsetId,
                    }))

                    await surveyModel.insertUserSkillsets(userSkillsets)
                }

                if (modIds.length > 0) {
                    const userMods = modIds.map((modId) => ({
                        userId,
                        modId,
                    }))

                    await surveyModel.insertUserMods(userMods)
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
