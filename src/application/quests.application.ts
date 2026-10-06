import QuestsService from '@/services/quests.service'
import questConfig from '@/config/quests.config'
import { AppError } from '@/errors/app-error'
import {
    getQuestCategoryByCode,
    isQuestCategoryCode,
    type QuestCategoryCode,
} from '@/config/seeds/quests-categories-seed'

import type { FastifyInstance } from 'fastify'

class QuestsApplication {
    constructor(private readonly app: FastifyInstance) {
        this.questService = new QuestsService(app.models.quests)
    }

    private readonly questService: QuestsService

    async getUserQuests(userId: number, categoryCode: number) {
        if (!isQuestCategoryCode(categoryCode)) {
            throw new AppError('Invalid category code', {
                code: 'INVALID_CATEGORY_CODE',
            })
        }
        const categoryId = (await this.app.models.quests.getQuestCategoryByCode(categoryCode)).id
        const userQuests = await this.app.models.quests.getUserQuests(userId, categoryId)
        const userQuestsExpired = await this.hasExpiredQuests(userQuests)

        if (!userQuestsExpired) {
            const category = getQuestCategoryByCode(categoryCode)

            if (!category) {
                throw new Error(`Category with code ${categoryCode} not found`)
            }

            const beatmaps = await this.generateUserQuestsBeatmaps(userId, categoryCode)

            if (beatmaps.length < 1) {
                throw new AppError('No user quests generated', { code: 'NO_QUESTS_GENERATED' })
            } else if (beatmaps.length < 6) {
                throw new AppError('Invalid amount of generated quests', {
                    code: 'INVALID_QUESTS_AMOUNT_GENERATED',
                })
            }

            const quests = await this.questService.generateUserQuests(
                beatmaps,
                category,
                this.app.services.beatmap.getBMComboDifficulty,
            )

            console.log('Result:', quests)
            const beatmapsIds = beatmaps.map((beatmap) => Object.values(beatmap)[0]!.beatmapId)

            await this.replaceUserQuests(userId, categoryId, beatmapsIds)
        } else {
            console.log('quests are not expired')
            return userQuests
        }
    }

    async generateUserQuestsBeatmaps(userId: number, categoryCode: QuestCategoryCode) {
        const userSkillsetsPreferences = await this.app.services.user.getUserPreferences(userId)

        const beatmaps = await this.app.services.quests.getQuestsBeatmaps(
            userId,
            userSkillsetsPreferences,
            questConfig.questsPerGeneration,
            this.app.services.user.forwardOrRerollSkillset,
            categoryCode,
        )

        return beatmaps.filter(
            (beatmap) => typeof Object.values(beatmap)[0]?.beatmapId === 'number',
        )
    }

    async replaceUserQuests(userId: number, categoryId: number, beatmapsIds: number[]) {
        return await this.app.db.transaction(async (tx) => {
            const txQuestsModel = this.app.models.factories.quests(tx)
            await txQuestsModel.deleteAllUserQuests(userId, categoryId)

            const txQuestsService = new QuestsService(txQuestsModel)
            await txQuestsService.saveUserQuests(userId, beatmapsIds, categoryId)
        })
    }

    async hasExpiredQuests(quests: { expiresAt: Date }[]) {
        return quests.some((quest) => quest.expiresAt.getTime() < Date.now())
    }
}

export default QuestsApplication
