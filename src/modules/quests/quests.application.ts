import questConfig from '@/config/quests.config'
import {
    getQuestCategoryByCode,
    isQuestCategoryCode,
    type Category,
} from '@/config/seeds/quests-categories-seed'
import { AppError } from '@/errors/app-error'

import type { FastifyInstance } from 'fastify'
import type { QuestBeatmap } from './quests.types'

const ignoreQuestsExpiration = true

class QuestsApplication {
    constructor(private readonly app: FastifyInstance) {}

    async getUserQuests(userId: number, categoryCode: number) {
        const categoryId = await this.getCategoryId(categoryCode)

        const userQuests = await this.app.modules.quests.repository.getUserQuests(
            userId,
            categoryId,
        )

        const userQuestsExpired = await this.hasExpiredQuests(userQuests)

        if (userQuestsExpired || ignoreQuestsExpiration) {
            const category = getQuestCategoryByCode(categoryCode)
            if (!category) throw new Error(`Category with code ${categoryCode} not found`)

            const beatmapsIds = await this.generateUserQuests(userId, category)

            await this.replaceUserQuests(userId, categoryId, beatmapsIds)
        } else {
            console.log('quests are not expired')
            return userQuests
        }
    }

    async generateUserQuests(userId: number, category: Category) {
        const maxQuestsPP = this.app.modules.quests.service.getQuestCategoryAveragePP(category)

        const beatmaps = await this.generateUserQuestsBeatmaps(userId, maxQuestsPP, category)

        if (beatmaps.length < 1) {
            throw new AppError('No user quests generated', { code: 'NO_QUESTS_GENERATED' })
        } else if (beatmaps.length < 6) {
            throw new AppError('Invalid amount of generated quests', {
                code: 'INVALID_QUESTS_AMOUNT_GENERATED',
            })
        }

        const beatmapIds = this.getBeatmapIdsFromSkillsetBeatmapsObject(beatmaps)

        const quests = await this.app.modules.quests.service.generateUserQuests(
            beatmapIds,
            category,
            this.app.modules.beatmaps.service.getBMComboDifficulty,
        )

        console.log('Result:', quests)
        return beatmaps.map((beatmap) => Object.values(beatmap)[0]!.beatmapId)
    }

    async generateUserQuestsBeatmaps(userId: number, maxQuestsPP: number, category: Category) {
        const userSkillsetsPreferences =
            await this.app.modules.user.service.getUserPreferences(userId)

        const beatmaps = await this.app.modules.quests.service.getQuestsBeatmaps(
            userId,
            userSkillsetsPreferences,
            questConfig.questsPerGeneration,
            maxQuestsPP,
            this.app.modules.user.service.forwardOrRerollSkillset,
            category,
        )

        return beatmaps.filter(
            (beatmap) => typeof Object.values(beatmap)[0]?.beatmapId === 'number',
        )
    }

    async replaceUserQuests(userId: number, categoryId: number, beatmapsIds: number[]) {
        return await this.app.db.transaction(async (tx) => {
            const txQuestRepository = new this.app.modules.quests.RepositoryClass(tx)
            await txQuestRepository.deleteAllUserQuests(userId, categoryId)

            const txQuestsService = new this.app.modules.quests.ServiceClass(txQuestRepository)
            await txQuestsService.saveUserQuests(userId, beatmapsIds, categoryId)
        })
    }

    async getCategoryId(categoryCode: number) {
        if (!isQuestCategoryCode(categoryCode)) {
            throw new AppError('Invalid category code', {
                code: 'INVALID_CATEGORY_CODE',
            })
        }

        return (await this.app.modules.quests.repository.getQuestCategoryByCode(categoryCode)).id
    }

    async hasExpiredQuests(quests: { expiresAt: Date }[]) {
        return quests.some((quest) => quest.expiresAt.getTime() < Date.now())
    }

    getBeatmapIdsFromSkillsetBeatmapsObject(beatmaps: { Skillset: QuestBeatmap }[]) {
        return beatmaps.map((beatmap) => {
            const [skillset, beatmapBody] = Object.entries(beatmap)[0]

            return {
                [skillset]: beatmapBody.beatmapId,
            }
        }) as { Skillset: number }[]
    }
}

export default QuestsApplication
