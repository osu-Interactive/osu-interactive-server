import { AppError } from '@/errors/app-error'
import type { SurveyModel } from '@/models/survey.model'
import type { SurveyResult } from '@/types/survey.types'
import type { TagsModel } from '@/models/tags.model'

export type SurveyService = ReturnType<typeof createSurveyService>

const createSurveyService = (surveyModel: SurveyModel, tagsModel: TagsModel) => ({
    async save(userId: number, surveyRes: SurveyResult) {
        const errors: Record<string, string> = {}

        if (!Array.isArray(surveyRes?.skillsetsCodes)) {
            errors.skillsets = 'skillsetsCodes must be an array'
        }

        if (!Array.isArray(surveyRes?.modsCodes)) {
            errors.mods = 'modsCodes must be an array'
        }

        if (Object.keys(errors).length > 0) {
            throw AppError.validationError(errors)
        }

        const skillsets = await tagsModel.getSkillsetsByCodes(surveyRes.skillsetsCodes)
        const mods = await tagsModel.getModsByCodes(surveyRes.modsCodes)

        const skillsetIds = skillsets.map((x) => x.id)
        const modIds = mods.map((x) => x.id)

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
    },

    getUserFavoriteSkillsets(userId: number) {
        return surveyModel.getUserSkillsets(userId)
    },

    getUserFavoriteMods(userId: number) {
        return surveyModel.getUserMods(userId)
    },
})

export default createSurveyService
