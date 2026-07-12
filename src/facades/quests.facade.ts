import { QuestsService, SurveyService } from '@/types/services.types'

export type UserPreferences = {
    mods: string[]
    skillsets: string[]
}

export default (questsService: QuestsService, surveyService: SurveyService) => ({
    getUserQuests: async (userId: number) => {
        const userMods = await surveyService.getUserFavoriteMods(userId)
        const userModsMapped = userMods.map((userMod) => userMod.modCode)

        const userSkillsets = await surveyService.getUserFavoriteSkillsets(userId)
        const userSkillsetsMapped = userSkillsets.map((userSkillset) => userSkillset.skillsetCode)

        await questsService.getUserQuests(userId, { mods: userModsMapped, skillsets: userSkillsetsMapped })
    },
})
