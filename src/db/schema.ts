import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core'

export const testTable = pgTable('TestTable', {
    id: serial('id').primaryKey(),
    text: text('text').notNull(),
})
