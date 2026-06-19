import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core'

export const questCategories = pgTable('quest_categories', {
    id: serial('id').primaryKey(),

    name: text('name').notNull(),
    code: integer('code').notNull(),
    minPP: integer('min_pp').notNull(),
    maxPP: integer('max_pp'),
})
