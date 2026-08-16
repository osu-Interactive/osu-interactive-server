import SurveyService from '@/services/survey.service'
import QuestsService from '@/services/quests.service'
import type { FastifyInstance } from 'fastify'

export type UserPreferences = {
    mods: string[]
    skillsets: string[]
}

export default (app: FastifyInstance) => {
    const surveyService = SurveyService(app.models.survey, app.models.tags)
    const questsService = QuestsService(app.models.quests)

    return {
        getUserQuests: async (userId: number) => {
            const userMods = await surveyService.getUserFavoriteMods(userId)
            const userModsMapped = userMods.map((userMod) => userMod.modCode)

            const userSkillsets = await surveyService.getUserFavoriteSkillsets(userId)
            const userSkillsetsMapped = userSkillsets.map(
                (userSkillset) => userSkillset.skillsetCode,
            )

            await questsService.getUserQuests(userId, {
                mods: userModsMapped,
                skillsets: userSkillsetsMapped,
            })
        },
    }

}
