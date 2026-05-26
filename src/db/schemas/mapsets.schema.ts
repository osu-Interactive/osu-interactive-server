import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const mapsets = pgTable('mapsets', {
    id: serial('id').primaryKey(),

    mapset_id: integer('mapset_id').notNull().unique(),
    status: text('status').notNull(),
    title: text('title').notNull(),
    creator: text('creator').notNull(),
    bpm: integer('bpm').notNull(),
    ranked_date: timestamp('ranked_date'),
    submitted_date: timestamp('submitted_date').notNull(),

    created_at: timestamp('created_at').defaultNow().notNull(),
})
