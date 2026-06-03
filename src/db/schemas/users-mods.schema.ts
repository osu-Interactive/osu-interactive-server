import { pgTable, serial, integer } from 'drizzle-orm/pg-core'

export const usersMods = pgTable('users_mods', {
    id: serial('id').primaryKey(),

    userId: integer('user_id').notNull(),

    modId: integer('mod_id').notNull(),
})
