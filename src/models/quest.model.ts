import { sql, or } from 'drizzle-orm'
import { DBExecutor } from '@/types/drizzle-pg-db.types'
import { questCategories, beatmapSkillsets } from '@/db/schemas/schema'
import type { QuestCategory } from '@/types/osu.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'

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

    getBeatmapsByDominatedSkillsets(skillsets: Skillset[]) {
        console.log(skillsets)

        if (skillsets.length === 0) {
            throw new Error('Skillsets array has no items')
        } else if (skillsets.length > 15) {
            throw new Error('Skillsets array has too many items')
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

        return Promise.all(
            skillsets.map(async (skillset) => {
                const skillsetColumn = beatmapSkillsets[skillset]

                const [beatmap] = await db
                    .select()
                    .from(beatmapSkillsets)
                    .where(sql`${skillsetColumn} >= ${highest}`)
                    .orderBy(sql`random()`)
                    .limit(1)

                return beatmap
            }),
        )
    },
})
