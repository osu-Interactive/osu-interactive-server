import { pgTable, serial, integer, timestamp, text } from 'drizzle-orm/pg-core'
import { users, mapsetsBeatmaps, questCategories } from './schema'

export const userQuests = pgTable('user_quests', {
    id: serial('id').primaryKey(),

    userId: integer('userId')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),

    title: text(),

    beatmapId: integer('beatmap_id')
        .references(() => mapsetsBeatmaps.id, { onDelete: 'cascade' })
        .notNull(),

    categoryId: integer('category_id')
        .references(() => questCategories.id, {
            onDelete: 'restrict',
        })
        .notNull(),

    expiresAt: timestamp({ withTimezone: true }).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
