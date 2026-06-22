import { pgTable, integer, timestamp } from 'drizzle-orm/pg-core'

export const nonexistentMapsets = pgTable('nonexistent_mapsets', {
    osu_id: integer('osu_id').primaryKey(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
