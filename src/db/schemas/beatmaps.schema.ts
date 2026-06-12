import {
    pgTable,
    serial,
    integer,
    real,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'
import { mapsets } from './mapsets.schema'

export const mapsetsBeatmaps = pgTable('mapsets_beatmaps', {
    id: serial('id').primaryKey(),

    beatmap_id: integer('beatmap_id').notNull().unique(),

    mapset_id: integer('mapset_id')
        .notNull()
        .references(() => mapsets.mapset_id, {
            onDelete: 'cascade',
        }),
    mode: text('mode', {
        enum: ['osu', 'taiko', 'fruits', 'mania'],
    }).notNull(),
    difficulty_rating: real('difficulty_rating').notNull(),
    status: text('status').notNull(),
    max_combo: integer('max_combo'),
    accuracy: real('accuracy').notNull(),
    ar: real('ar').notNull(),
    bpm: real('bpm').notNull(),
    cs: real('cs').notNull(),
    drain: real('drain').notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
})
