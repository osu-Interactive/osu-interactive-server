import { pgTable, serial, integer, doublePrecision } from 'drizzle-orm/pg-core'
import { users } from './schema'

export const userPreferences = pgTable('user_preferences', {
    id: serial('id').primaryKey(),

    userId: integer('user_id').references(() => users.id, {
        onDelete: 'cascade',
    }).unique(),

    jumps: doublePrecision('jumps').notNull(),
    streams: doublePrecision('streams').notNull(),
    fingerControl: doublePrecision('finger_control').notNull(),
    tech: doublePrecision('tech').notNull(),
    alternate: doublePrecision('alternate').notNull(),
    gimmick: doublePrecision('gimmick').notNull(),
})
