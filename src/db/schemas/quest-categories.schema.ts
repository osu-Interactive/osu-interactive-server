import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const questsCategories = pgTable('quest_categories', {
    id: serial('id').primaryKey(),

    name: text('name').notNull(),
})
