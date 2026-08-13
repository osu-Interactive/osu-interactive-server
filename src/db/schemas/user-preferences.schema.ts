import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { users } from './schema'

export const userPreferences = pgTable('user_preferences', {
    id: serial('id').primaryKey(),

    userId: integer('user_id').references(() => users.id, {
        onDelete: 'cascade',
    }),

    jumps: integer('jumps').notNull(),
    streams: integer('streams').notNull(),
    fingerControl: integer('finger_control').notNull(),
    tech: integer('tech').notNull(),
    alternate: integer('alternate').notNull(),
    gimmick: integer('gimmick').notNull(),
})
