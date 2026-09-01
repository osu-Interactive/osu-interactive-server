import QuestsService from '@/services/quests.service'
import questConfig from '@/config/quests.config'
import { AppError } from '@/errors/app-error'
import type { FastifyInstance } from 'fastify'

export default (app: FastifyInstance) => {
    return {
        async getUserQuests(userId: number, categoryCode: number) {
            const categoryId = (await app.models.quests.getQuestCategoryByCode(categoryCode)).id
            const userQuests = await app.models.quests.getUserQuests(userId, categoryId)
            const userQuestsExpired = await this.areUserQuestsExpired(userQuests)

            if (!userQuestsExpired) {
                const userSkillsetsPreferences = await app.services.user.getUserPreferences(userId)

                if (!userSkillsetsPreferences) {
                    throw new AppError('Unable to get user preferences', {
                        code: 'UNDEFINED_USER_PREFERENCES'
                    })
                }

                const questBeatmapIds = await app.services.quests.generateUserQuests(
                    userId,
                    userSkillsetsPreferences,
                    questConfig.questsPerGeneration,
                    app.services.user.forwardOrRerollSkillset,
                    categoryCode,
                )

                console.log(questBeatmapIds)

                await app.db.transaction(async (tx) => {
                    const txQuestsModel = app.models.factories.quests(tx)
                    await txQuestsModel.deleteAllUserQuests(userId, categoryId)

                    const txQuestsService = QuestsService(txQuestsModel)
                    await txQuestsService.saveUserQuests(userId, questBeatmapIds, categoryId)
                })
            } else {
                console.log('quests are not expired')
                return userQuests
            }
        },

        async areUserQuestsExpired(quests: { expiresAt: Date}[]) {
            return quests.some((quest) => quest.expiresAt.getTime() < Date.now())
        },
    }
}
