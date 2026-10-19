import questConfig from '@/config/quests.config'
import BeatmapsSelector from '@/modules/quests/private/quests-generation/beatmaps-selector'
import {
    getQuestCategoryByCode,
    isQuestCategoryCode,
    type Category,
} from '@/config/seeds/quests-categories-seed'
import { AppError } from '@/errors/app-error'
import { type Skillset } from '@/config/seeds/skillsets-seed'

import type { FastifyInstance } from 'fastify'
import type { QuestBeatmap, PpBySkillset } from './quests.types'

const ignoreQuestsExpiration = true

class QuestsApplication {
    private readonly beatmapsSelector: BeatmapsSelector

    constructor(private readonly app: FastifyInstance) {
        this.beatmapsSelector = new BeatmapsSelector(app.modules.quests.repository)
    }

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

            await this.replaceUserQuestsDB(userId, categoryId, beatmapsIds)
        } else {
            console.log('quests are not expired')
            return userQuests
        }
    }

    async generateUserQuests(userId: number, category: Category) {
        const maxQuestsPP = this.app.modules.quests.service.getQuestCategoryAveragePP(category)

        const beatmaps = await this.selectUserQuestBeatmaps(userId, maxQuestsPP, category)

        if (beatmaps.length < 1) {
            throw new AppError('No user quests generated', { code: 'NO_QUESTS_GENERATED' })
        } else if (beatmaps.length < 6) {
            throw new AppError('Invalid amount of generated quests', {
                code: 'INVALID_QUESTS_AMOUNT_GENERATED',
            })
        }

        let beatmapIds = this.getBeatmapIdsFromSkillsetBeatmapsObject(beatmaps)

        const quests = await this.app.modules.quests.service.buildUserQuestsFromBeatmaps(
            beatmapIds,
            category,
            this.app.modules.beatmaps.service.getBMComboDifficulty,
        )

        console.log(quests[0])

        console.log('Result:', quests)
        return beatmaps.map((beatmap) => beatmap.beatmapBody.beatmapId)
    }

    async selectUserQuestBeatmaps(userId: number, maxQuestsPP: number, category: Category) {
        const userFatigue = (await this.app.modules.user.repository.getFatigue(userId))[0]

        const userSkillsetsPreferences =
            await this.app.modules.user.service.getUserPreferences(userId)

        const beatmaps = await this.beatmapsSelector.selectUserQuestBeatmaps(
            userFatigue,
            userSkillsetsPreferences,
            questConfig.questsPerGeneration,
            maxQuestsPP,
            category,
        )

        return beatmaps.filter(
            (item): item is { skillset: Skillset; beatmapBody: QuestBeatmap } =>
                item != null &&
                item.beatmapBody != null &&
                typeof item.beatmapBody.beatmapId === 'number',
        )
    }

    async replaceUserQuestsDB(userId: number, categoryId: number, beatmapsIds: number[]) {
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

    getBeatmapIdsFromSkillsetBeatmapsObject(
        beatmaps: { skillset: Skillset; beatmapBody: QuestBeatmap }[],
    ): PpBySkillset[] {
        return beatmaps.map((beatmap) => {
            return {
                [beatmap.skillset]: beatmap.beatmapBody.beatmapId,
            }
        })
    }
}

export default QuestsApplication
