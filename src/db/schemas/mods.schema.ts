import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'

export const mods = pgTable('mods', {
    id: serial('id').primaryKey(),

    code: varchar('code', { length: 32 }).notNull(),

    name: varchar('name', { length: 64 }).notNull(),
})
