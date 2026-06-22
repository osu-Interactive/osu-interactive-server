import { pgTable, integer, real, text, timestamp } from 'drizzle-orm/pg-core'
import { mapsets } from './mapsets.schema'

export const mapsetsBeatmaps = pgTable('mapsets_beatmaps', {
    id: integer('id').primaryKey(),

    mapsetId: integer('mapset_id')
        .notNull()
        .references(() => mapsets.id, {
            onDelete: 'cascade',
        }),

    mode: text('mode', {
        enum: ['osu', 'taiko', 'fruits', 'mania'],
    }).notNull(),
    status: text('status').notNull(),
    stars: real('stars').notNull(),
    bpm: real('bpm').notNull(),
    combo: integer('combo'),
    ar: real('ar').notNull(),
    cs: real('cs').notNull(),
    od: real('od').notNull(),
    hp: real('hp').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
