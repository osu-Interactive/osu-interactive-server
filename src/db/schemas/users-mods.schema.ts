import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { users, mods } from './schema'

export const usersMods = pgTable('users_mods', {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    modId: integer('mod_id')
        .references(() => mods.id, {
            onDelete: 'cascade',
        })
        .notNull(),
})
