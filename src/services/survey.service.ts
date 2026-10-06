import { AppError } from '@/errors/app-error'
import type { SurveyModel, SurveyModelFactory } from '@/models/survey.model'
import type { SurveyResult } from '@/types/survey.types'
import type { TagsModel } from '@/models/tags.model'
import type { DB, DBTransaction } from '@/types/drizzle-pg-db.types'

type SaveConnection = { db: DB; tx?: never } | { tx: DBTransaction; db?: never }

class SurveyService {
    constructor(
        private readonly surveyModel: SurveyModel,
        private readonly tagsModel: TagsModel,
    ) {}

    async save(
        userId: number,
        surveyRes: SurveyResult,
        surveyModelFactory: SurveyModelFactory,
        connection: SaveConnection,
    ) {
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

        if (connection.tx) {
            await this.saveInternal(userId, surveyRes, surveyModelFactory(connection.tx))
        } else {
            await connection.db.transaction((tx) =>
                this.saveInternal(userId, surveyRes, surveyModelFactory(tx)),
            )
        }
    }

    async saveInternal(userId: number, surveyRes: SurveyResult, surveyModelTx: SurveyModel) {
        const skillsets = await this.tagsModel.getSkillsetsByCodes(surveyRes.skillsetsCodes)
        const mods = await this.tagsModel.getModsByCodes(surveyRes.modsCodes)

        const skillsetIds = skillsets.map((x) => x.id)
        const modIds = mods.map((x) => x.id)

        await surveyModelTx.deleteAllUserSkillsets(userId)
        await surveyModelTx.deleteAllUserMods(userId)

        if (skillsetIds.length > 0) {
            const userSkillsets = skillsetIds.map((skillsetId) => ({
                userId,
                skillsetId,
            }))

            await surveyModelTx.insertUserSkillsets(userSkillsets)
        }

        if (modIds.length > 0) {
            const userMods = modIds.map((modId) => ({
                userId,
                modId,
            }))

            await surveyModelTx.insertUserMods(userMods)
        }
    }

    getUserFavoriteSkillsets(userId: number) {
        return this.surveyModel.getUserSkillsets(userId)
    }

    getUserFavoriteMods(userId: number) {
        return this.surveyModel.getUserMods(userId)
    }
}

export default SurveyService
