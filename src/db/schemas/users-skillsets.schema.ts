import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { users, skillsets } from './schema'

export const usersSkillsets = pgTable('users_skillsets', {
    id: serial('id').primaryKey(),

    userId: integer('user_id')
        .references(() => users.id, {
            onDelete: 'cascade',
        })
        .notNull(),

    skillsetId: integer('skillset_id')
        .references(() => skillsets.id, {
            onDelete: 'cascade',
        })
        .notNull(),
})
