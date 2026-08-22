import QuestsService from '@/services/quests.service'
import UserService from '@/services/user.service'
import questConfig from '@/config/quests.config'
import type { FastifyInstance } from 'fastify'

export default (app: FastifyInstance) => {
    const questsService = QuestsService(app.models.quests)
    const userService = UserService(app.models.user)

    return {
        getUserQuests: async (userId: number) => {
            const userSkillsetsPreferences = await userService.getUserPreferences(userId)

            const quests = await questsService.getUserQuests(
                userId,
                userSkillsetsPreferences,
                questConfig.questsPerGeneration,
                userService.forwardOrRerollSkillset,
            )

            console.log(quests)
        },
    }
}
