import type { DB, DBExecutor } from '@/types/drizzle-pg-db.types'
import { surveyModel } from '@/models/survey.model'
import { AppError } from '@/errors/app-error'

type SurveyModelFactory = (db: DBExecutor) => ReturnType<typeof surveyModel>

type SurveyResult = {
    skillsetsIds: number[]
    modsIds: number[]
}

export default class SurveyService {
    constructor(
        private readonly db: DB,
        private readonly makeSurveyModel: SurveyModelFactory = surveyModel,
    ) {}

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
            const surveyModel = this.makeSurveyModel(tx)

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
        return this.makeSurveyModel(this.db).getUserSkillsets(userId)
    }
}
