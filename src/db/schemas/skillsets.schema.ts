import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const skillsets = pgTable('skillsets', {
    id: serial('id').primaryKey(),

    code: text('code').unique().notNull(),

    name: text('name').notNull(),

    surveyDescription: text('survey_description').notNull(),
})
