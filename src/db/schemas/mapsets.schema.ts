import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const mapsets = pgTable('mapsets', {
    id: serial('id').primaryKey(),

    osuId: integer('osu_id').notNull().unique(),
    title: text('title').notNull(),
    artist: text('artist').notNull(),
    status: text('status').notNull(),
    creator: text('creator').notNull(),
    bpm: integer('bpm').notNull(),
    rankedDate: timestamp('ranked_date'),
    submittedDate: timestamp('submitted_date').notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
