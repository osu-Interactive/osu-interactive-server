import { pgTable, serial, text, integer, jsonb, timestamp  } from 'drizzle-orm/pg-core'

export const users  = pgTable('users', {
    id: serial('id').primaryKey(),

    osu_id: integer('osu_id').notNull().unique(),
    name: text('name').notNull(),
    avatar_url: text('avatar_url').notNull(),
    pp: integer('pp').notNull(),

    country: jsonb('country').$type<{
        code: string
        name: string
    }>().notNull(),

    survey_result: jsonb('survey_result'),

    created_at: timestamp('created_at').defaultNow().notNull()
})
