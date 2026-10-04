import CreateQuestsService, { type Beatmap } from '@/services/quests.service'
import questConfig from '@/config/quests.config'
import { AppError } from '@/errors/app-error'
import {
    Category,
    getQuestCategoryByCode,
    isQuestCategoryCode,
    type QuestCategoryCode,
} from '@/config/seeds/quests-categories-seed'

import type { FastifyInstance } from 'fastify'
import { Skillset } from '@/config/seeds/skillsets-seed'

export default (app: FastifyInstance) => ({
    async getUserQuests(userId: number, categoryCode: number) {
        if (!isQuestCategoryCode(categoryCode)) {
            throw new AppError('Invalid category code', {
                code: 'INVALID_CATEGORY_CODE',
            })
        }
        const categoryId = (await app.models.quests.getQuestCategoryByCode(categoryCode)).id
        const userQuests = await app.models.quests.getUserQuests(userId, categoryId)
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

            const quests = await this.generateUserQuests(beatmaps, category)

            console.log('Result:', quests)
            const beatmapsIds = beatmaps.map((beatmap) => Object.values(beatmap)[0]!.beatmapId)

            await this.replaceUserQuests(userId, categoryId, beatmapsIds)
        } else {
            console.log('quests are not expired')
            return userQuests
        }
    },

    async generateUserQuestsBeatmaps(userId: number, categoryCode: QuestCategoryCode) {
        const userSkillsetsPreferences = await app.services.user.getUserPreferences(userId)

        const beatmaps = await app.services.quests.getQuestsBeatmaps(
            userId,
            userSkillsetsPreferences,
            questConfig.questsPerGeneration,
            app.services.user.forwardOrRerollSkillset,
            categoryCode,
        )

        return beatmaps.filter(
            (beatmap) => typeof Object.values(beatmap)[0]?.beatmapId === 'number',
        )
    },

    async generateUserQuests(beatmaps: { Skillset: Beatmap }[], category: Category) {
        const quests = []
        const excludedBeatmapIds: number[] = []

        for (const beatmap of beatmaps) {
            const [skillset, beatmapBody] = Object.entries(beatmap)[0]
            if (!beatmapBody) {
                console.log(1111111111)
                continue
            }

            const quest = await this.generateQuest(
                beatmapBody,
                skillset as Skillset,
                excludedBeatmapIds,
                category,
            )

            if (!quest || !quest.id) {
                throw new Error('Quest generation failed')
            }

            quests.push({ [skillset]: quest.id, combo: quest.combo })
        }

        return quests
    },

    async generateQuest(
        beatmap: Beatmap,
        skillset: Skillset,
        excludedBeatmapIds: number[],
        category: NonNullable<ReturnType<typeof getQuestCategoryByCode>>,
    ) {
        //TODO: Fix duplicates
        let currentBeatmapId = beatmap.beatmapId
        excludedBeatmapIds.push(currentBeatmapId)

        while (true) {
            try {
                const combo = await app.services.beatmap.getBMComboDifficulty(
                    currentBeatmapId,
                    category,
                )

                console.log(`Beatmap ${currentBeatmapId} is valid`)
                excludedBeatmapIds.push(currentBeatmapId)

                return { id: currentBeatmapId, combo }
            } catch (error) {
                const newBeatmap = await this.findReplacementBeatmap(error, skillset, category, [
                    ...excludedBeatmapIds,
                ])

                if (!newBeatmap) {
                    break
                }

                currentBeatmapId = newBeatmap.beatmapId
                excludedBeatmapIds.push(currentBeatmapId)
            }
        }
    },

    async findReplacementBeatmap(
        error: unknown,
        skillset: Skillset,
        category: Category,
        excludedBeatmapIds: number[],
    ) {
        if (!(error instanceof AppError) || error.code !== 'BEATMAP_PP_TOO_LOW') {
            throw error
        }

        const newBeatmaps = await app.services.quests.getBeatmaps(
            [skillset as Skillset],
            category,
            excludedBeatmapIds,
        )

        return newBeatmaps[0]
    },

    async replaceUserQuests(userId: number, categoryId: number, beatmapsIds: number[]) {
        return await app.db.transaction(async (tx) => {
            const txQuestsModel = app.models.factories.quests(tx)
            await txQuestsModel.deleteAllUserQuests(userId, categoryId)

            const txQuestsService = CreateQuestsService(txQuestsModel)
            await txQuestsService.saveUserQuests(userId, beatmapsIds, categoryId)
        })
    },

    async hasExpiredQuests(quests: { expiresAt: Date }[]) {
        return quests.some((quest) => quest.expiresAt.getTime() < Date.now())
    },
})
