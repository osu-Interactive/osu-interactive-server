import QuestsService from '@/services/quests.service'
import questConfig from '@/config/quests.config'
import { AppError } from '@/errors/app-error'
import { isQuestCategoryCode, type QuestCategoryCode } from '@/config/seeds/quests-categories-seed'

import type { FastifyInstance } from 'fastify'

export default (app: FastifyInstance) => ({
    async getUserQuests(userId: number, categoryCode: number) {
        if (!isQuestCategoryCode(categoryCode)) {
            throw new AppError('Invalid category code', {
                code: 'INVALID_CATEGORY_CODE',
            })
        }
        const categoryId = (await app.models.quests.getQuestCategoryByCode(categoryCode)).id
        const userQuests = await app.models.quests.getUserQuests(userId, categoryId)
        const userQuestsExpired = await this.areUserQuestsExpired(userQuests)

        if (!userQuestsExpired) {
            const beatmapIds = await this.generateUserQuests(userId, categoryCode)
            await this.saveUserQuests(userId, categoryId, beatmapIds)
        } else {
            console.log('quests are not expired')
            return userQuests
        }
    },

    async generateUserQuests(userId: number, categoryCode: QuestCategoryCode) {
        const userSkillsetsPreferences = await app.services.user.getUserPreferences(userId)

        if (!userSkillsetsPreferences) {
            throw new AppError('Unable to get user preferences', {
                code: 'UNDEFINED_USER_PREFERENCES',
            })
        }

        let beatmapIds = await app.services.quests.generateUserQuests(
            userId,
            userSkillsetsPreferences,
            questConfig.questsPerGeneration,
            app.services.user.forwardOrRerollSkillset,
            categoryCode,
        )

        beatmapIds = beatmapIds.filter((id) => typeof id === 'number')
        console.log(beatmapIds)

        for (const id of beatmapIds) {
            await app.services.beatmap.getBMComboDifficulty(id, categoryCode)
        }

        return beatmapIds
    },

    async saveUserQuests(userId: number, categoryId: number, beatmapsIds: number[]) {
        return await app.db.transaction(async (tx) => {
            const txQuestsModel = app.models.factories.quests(tx)
            await txQuestsModel.deleteAllUserQuests(userId, categoryId)

            const txQuestsService = QuestsService(txQuestsModel)
            await txQuestsService.saveUserQuests(userId, beatmapsIds, categoryId)
        })
    },

    async areUserQuestsExpired(quests: { expiresAt: Date }[]) {
        return quests.some((quest) => quest.expiresAt.getTime() < Date.now())
    },
})
