import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core'

export const nonexistentMapsets = pgTable('nonexistent_mapsets', {
    id: serial('id').primaryKey(),

    mapset_id: integer('mapset_id').notNull().unique(),

    created_at: timestamp('created_at').defaultNow().notNull(),
})
