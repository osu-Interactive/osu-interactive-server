import QuestsService from '@/services/quests.service'
import UserService from '@/services/user.service'
import questConfig from '@/config/quests.config'
import type { FastifyInstance } from 'fastify'

export default (app: FastifyInstance) => {
    const questsService = QuestsService(app.models.quests)
    const userService = UserService(app.models.user)

    return {
        async getUserQuests(userId: number, categoryCode: number) {
            const userSkillsetsPreferences = await userService.getUserPreferences(userId)

            const categoryId = (await app.models.quests.getQuestCategoryByCode(categoryCode)).id

            console.log(await this.areUserQuestsExpired(userId, categoryId))

            const questBeatmapIds = await questsService.generateUserQuests(
                userId,
                userSkillsetsPreferences,
                questConfig.questsPerGeneration,
                userService.forwardOrRerollSkillset,
                categoryCode,
            )

            console.log(questBeatmapIds)

            await questsService.saveUserQuests(userId, questBeatmapIds, categoryId)
        },

        async areUserQuestsExpired(userId: number, categoryId: number) {
            const userQuests = await app.models.quests.getUserQuests(userId, categoryId)

            return userQuests.some((quest) => quest.expiresAt.getTime() < Date.now())
        },
    }
}
