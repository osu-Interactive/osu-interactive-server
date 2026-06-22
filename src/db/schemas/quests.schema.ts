import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { mapsetsBeatmaps, questCategories } from './schema'

export const quests = pgTable('quests', {
    id: serial('id').primaryKey(),

    title: text(),

    beatmapId: integer('beatmap_id')
        .references(() => mapsetsBeatmaps.id, { onDelete: 'cascade' })
        .notNull(),

    categoryId: integer('category_id')
        .references(() => questCategories.id, {
            onDelete: 'restrict',
        })
        .notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
