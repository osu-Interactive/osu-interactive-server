import type { DB } from '@/types/drizzle-pg-db.types'
import  { SurveyModelFactory } from '@/models/survey.model'
import { AppError } from '@/errors/app-error'

type SurveyResult = {
    skillsetsIds: number[]
    modsIds: number[]
}

export default class SurveyService {
    private surveyModel

    constructor(
        private db: DB,
        private surveyModelFactory: SurveyModelFactory,
    ) {
        this.surveyModel = this.surveyModelFactory(this.db)
    }

    public async save(userId: number, survey: SurveyResult) {
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

        return this.db.transaction(async (tx) => {
            const surveyModel = this.surveyModelFactory(tx)

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
    }

    getUserFavoriteSkillsets = (userId: number) => {
        return this.surveyModel.getUserSkillsets(userId)
    }

    getUserFavoriteMods = (userId: number) => {
        return this.surveyModel.getUserMods(userId)
    }
}
