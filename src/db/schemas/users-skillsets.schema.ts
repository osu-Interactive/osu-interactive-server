import { pgTable, serial, integer } from 'drizzle-orm/pg-core'

export const usersSkillsets = pgTable('users_skillsets', {
    id: serial('id').primaryKey(),

    userId: integer('user_id').notNull(),

    skillsetId: integer('skillset_id').notNull(),
})
