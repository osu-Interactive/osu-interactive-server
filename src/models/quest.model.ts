import { DBExecutor } from '@/types/drizzle-pg-db.types'
import { questCategories, beatmapSkillsets } from '@/db/schemas/schema'
import type { Skillset, QuestCategory } from '@/types/osu.types'
import { sql, or } from 'drizzle-orm'

export type QuestModelFactory = typeof questsModel
export type QuestModel = ReturnType<QuestModelFactory>
export type BeatmapSkillset = Awaited<ReturnType<QuestModel['getRandomBeatmapSkillsets']>>[number]

export const questsModel = (db: DBExecutor) => ({
    setQuestsCategories(categories: QuestCategory[]) {
        return db
            .insert(questCategories)
            .values(categories)
            .onConflictDoUpdate({
                target: questCategories.code,
                set: {
                    name: sql.raw(`excluded.name`),
                    minPP: sql.raw(`excluded.min_pp`),
                    maxPP: sql.raw(`excluded.max_pp`),
                },
            })
    },

    getRandomBeatmapSkillsets(limit: number) {
        return db.select().from(beatmapSkillsets).orderBy(sql.raw(`random()`)).limit(limit)
    },

    getRandomMatchedBM(skillsets: Skillset[]) {
        if (skillsets.length === 0) {
            return Promise.resolve([])
        }

        const highest = sql<number>`
        GREATEST(
            ${beatmapSkillsets.jumps},
            ${beatmapSkillsets.streams},
            ${beatmapSkillsets.fingerControl},
            ${beatmapSkillsets.tech},
            ${beatmapSkillsets.alternate},
            ${beatmapSkillsets.gimmick}
        )
    `

        return db
            .select()
            .from(beatmapSkillsets)
            .where(
                or(
                    ...skillsets.map(skill =>
                        sql`${beatmapSkillsets[skill]} >= ${highest} * 0.75`
                    )
                )
            )
            .orderBy(sql`random()`)
            .limit(1)
    }
})
