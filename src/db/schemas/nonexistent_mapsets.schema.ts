import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core'

export const nonexistentMapsets = pgTable('nonexistent_mapsets', {
    id: serial('id').primaryKey(),

    mapsetId: integer('mapset_id').notNull().unique(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
})
