import questConfig from '@/config/quests.config'
import {
    getQuestCategoryByCode,
    isQuestCategoryCode,
    type QuestCategoryCode,
} from '@/config/seeds/quests-categories-seed'
import { AppError } from '@/errors/app-error'

import type { FastifyInstance } from 'fastify'
import type { Beatmap } from './types'

const ignoreQuestsExpiration = true

class QuestsApplication {
    constructor(private readonly app: FastifyInstance) {}

    async getUserQuests(userId: number, categoryCode: number) {
        if (!isQuestCategoryCode(categoryCode)) {
            throw new AppError('Invalid category code', {
                code: 'INVALID_CATEGORY_CODE',
            })
        }
        const categoryId = (await this.app.modules.quests.repository.getQuestCategoryByCode(categoryCode)).id
        const userQuests = await this.app.modules.quests.repository.getUserQuests(userId, categoryId)
        const userQuestsExpired = await this.hasExpiredQuests(userQuests)

        if (userQuestsExpired || ignoreQuestsExpiration) {
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

            const beatmapIds = this.getBeatmapIdsFromSkillsetBeatmapsObject(beatmaps)

            const quests = await this.app.modules.quests.service.generateUserQuests(
                beatmapIds,
                category,
                this.app.modules.beatmaps.service.getBMComboDifficulty,
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
        const userSkillsetsPreferences = await this.app.modules.user.service.getUserPreferences(userId)

        const beatmaps = await this.app.modules.quests.service.getQuestsBeatmaps(
            userId,
            userSkillsetsPreferences,
            questConfig.questsPerGeneration,
            this.app.modules.user.service.forwardOrRerollSkillset,
            categoryCode,
        )

        return beatmaps.filter(
            (beatmap) => typeof Object.values(beatmap)[0]?.beatmapId === 'number',
        )
    }

    async replaceUserQuests(userId: number, categoryId: number, beatmapsIds: number[]) {
        return await this.app.db.transaction(async (tx) => {
            const txQuestRepository = new this.app.modules.quests.createRepository(tx)
            await txQuestRepository.deleteAllUserQuests(userId, categoryId)

            const txQuestsService = new this.app.modules.quests.createService(txQuestRepository)
            await txQuestsService.saveUserQuests(userId, beatmapsIds, categoryId)
        })
    }

    async hasExpiredQuests(quests: { expiresAt: Date }[]) {
        return quests.some((quest) => quest.expiresAt.getTime() < Date.now())
    }

    getBeatmapIdsFromSkillsetBeatmapsObject(beatmaps: { Skillset: Beatmap }[]) {
        return beatmaps.map((beatmap) => {
            const [skillset, beatmapBody] = Object.entries(beatmap)[0]

            return {
                [skillset]: beatmapBody.beatmapId,
            }
        }) as { Skillset: number }[]
    }
}

export default QuestsApplication
