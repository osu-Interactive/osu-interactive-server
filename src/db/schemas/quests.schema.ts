import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { mapsetsBeatmaps, questCategories } from './schema'

export const quests = pgTable('quests', {
    id: serial('id').primaryKey(),

    title: text(),

    osuBeatmapId: integer('osu_beatmap_id')
        .references(() => mapsetsBeatmaps.osuId, { onDelete: 'cascade' })
        .notNull(),

    categoryId: integer('category_id')
        .references(() => questCategories.id, {
            onDelete: 'restrict',
        })
        .notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
