import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const mods = pgTable('mods', {
    id: serial('id').primaryKey(),

    code: text('code').unique().notNull(),

    name: text('name').notNull(),
})
