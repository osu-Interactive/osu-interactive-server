import { AppError } from '@/errors/app-error'
import type SurveyRepository from './survey.repository'
import type TagsRepository from '@/modules/tags/tags.repository'
import type { DB, DBTransaction } from '@/shared/types/db.types'
import type { SurveyClientData } from './survey.routes'

type SaveConnection = { db: DB; tx?: never } | { tx: DBTransaction; db?: never }

class SurveyService {
    constructor(
        private readonly surveyRepository: SurveyRepository,
        private readonly tagsRepository: TagsRepository,
    ) {}

    async save(
        userId: number,
        surveyRes: SurveyClientData,
        surveyRepository: typeof SurveyRepository,
        connection: SaveConnection,
    ) {
        const errors: Record<string, string> = {}

        if (!Array.isArray(surveyRes.skillsetsCodes)) {
            errors.skillsets = 'skillsetsCodes must be an array'
        }

        if (!Array.isArray(surveyRes.modsCodes)) {
            errors.mods = 'modsCodes must be an array'
        }

        if (Object.keys(errors).length > 0) {
            throw AppError.validationError(errors)
        }

        if (connection.tx) {
            await this.saveInternal(userId, surveyRes, new surveyRepository(connection.tx))
        } else {
            await connection.db.transaction((tx) =>
                this.saveInternal(userId, surveyRes, new surveyRepository(tx)),
            )
        }
    }

    async saveInternal(
        userId: number,
        surveyRes: SurveyClientData,
        surveyRepository: SurveyRepository,
    ) {
        const skillsets = await this.tagsRepository.getSkillsetsByCodes(surveyRes.skillsetsCodes)
        const mods = await this.tagsRepository.getModsByCodes(surveyRes.modsCodes)

        const skillsetIds = skillsets.map((x) => x.id)
        const modIds = mods.map((x) => x.id)

        await surveyRepository.deleteAllUserSkillsets(userId)
        await surveyRepository.deleteAllUserMods(userId)

        if (skillsetIds.length > 0) {
            const userSkillsets = skillsetIds.map((skillsetId) => ({
                userId,
                skillsetId,
            }))

            await surveyRepository.insertUserSkillsets(userSkillsets)
        }

        if (modIds.length > 0) {
            const userMods = modIds.map((modId) => ({
                userId,
                modId,
            }))

            await surveyRepository.insertUserMods(userMods)
        }
    }

    getUserFavoriteSkillsets(userId: number) {
        return this.surveyRepository.getUserSkillsets(userId)
    }

    getUserFavoriteMods(userId: number) {
        return this.surveyRepository.getUserMods(userId)
    }
}

export default SurveyService
