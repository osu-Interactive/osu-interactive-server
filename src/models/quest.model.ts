import { sql, eq, and, notInArray } from 'drizzle-orm'
import { DBExecutor } from '@/types/drizzle-pg-db.types'
import { questCategories, beatmapSkillsets, userQuests, mapsetsBeatmaps } from '@/db/schemas/schema'
import type { QuestCategory } from '@/types/osu.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type QuestModelFactory = typeof questsModel
export type QuestModel = ReturnType<QuestModelFactory>

export const questsModel = (db: DBExecutor) => ({
    setQuestsCategories(categories: readonly QuestCategory[]) {
        return db
            .insert(questCategories)
            .values([...categories])
            .onConflictDoUpdate({
                target: questCategories.code,
                set: {
                    name: sql.raw(`excluded.name`),
                    minPP: sql.raw(`excluded.min_pp`),
                    maxPP: sql.raw(`excluded.max_pp`),
                },
            })
    },

    getQuestsCategories() {
        return db.select().from(questCategories)
    },

    getRandomBeatmapSkillsets(limit: number) {
        return db.select().from(beatmapSkillsets).orderBy(sql.raw(`random()`)).limit(limit)
    },

    async getBeatmapsByDominatedSkillsets(
        skillsets: Skillset[],
        skillsetDifficultyRange: [min: number, max: number],
        minCombo: number,
        excludeBeatmapsIds: number[],
    ) {
        const [min, max] = skillsetDifficultyRange

        if (skillsets.length === 0) {
            throw new Error('Skillsets array has no items')
        }

        if (skillsets.length > 15) {
            throw new Error('Skillsets array has too many items')
        }

        const excludedIds = new Set(excludeBeatmapsIds)

        const results = []

        for (const skillset of skillsets) {
            const [result] = await db
                .select({
                    skillset: sql<Skillset>`${skillset}`,
                    beatmapSkillsets,
                })
                .from(beatmapSkillsets)
                .innerJoin(mapsetsBeatmaps, eq(mapsetsBeatmaps.id, beatmapSkillsets.beatmapId))
                .where(
                    and(
                        eq(beatmapSkillsets.dominantSkillset, skillset),
                        sql`${beatmapSkillsets[skillset]} BETWEEN ${min} AND ${max}`,
                        sql`${mapsetsBeatmaps.combo} >= ${minCombo}`,
                        eq(mapsetsBeatmaps.mode, 'osu'),
                        notInArray(mapsetsBeatmaps.id, [...excludedIds]),
                    ),
                )
                .orderBy(sql`random()`)
                .limit(1)

            if (result) {
                results.push(result.beatmapSkillsets)
                excludedIds.add(result.beatmapSkillsets.beatmapId)
            } else {
                results.push(undefined)
            }
        }

        return results
    },

    setUserQuests(userId: number, beatmapsIds: number[], categoryId: number, expiresAt: Date) {
        let values = []

        for (const beatmapId of beatmapsIds) {
            values.push({
                userId,
                beatmapId,
                title: 'placeholder',
                categoryId: categoryId,
                expiresAt,
            })
        }

        return db.insert(userQuests).values(values)
    },

    deleteAllUserQuests(userId: number, categoryId: number) {
        return db
            .delete(userQuests)
            .where(and(eq(userQuests.userId, userId), eq(userQuests.categoryId, categoryId)))
    },

    async getQuestCategoryByCode(code: number) {
        const category = await db.query.questCategories.findFirst({
            where: eq(questCategories.code, code),
        })

        if (!category) {
            throw new Error(`Quest category "${code}" not found`)
        }

        return category
    },

    getUserQuests(userId: number, categoryId: number) {
        return db
            .select()
            .from(userQuests)
            .where(and(eq(userQuests.userId, userId), eq(userQuests.categoryId, categoryId)))
    },
})
