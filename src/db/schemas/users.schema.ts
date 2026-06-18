import { pgTable, serial, text, integer, jsonb, timestamp  } from 'drizzle-orm/pg-core'

export const users  = pgTable('users', {
    id: serial('id').primaryKey(),

    osuId: integer('osu_id').notNull().unique(),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url').notNull(),
    pp: integer('pp').notNull(),

    country: jsonb('country').$type<{
        code: string
        name: string
    }>().notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull()
})
