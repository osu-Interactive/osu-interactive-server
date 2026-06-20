import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { quests, mods } from './schema'

export const questModsSchema = pgTable('quest_mods', {
    id: serial('id').primaryKey(),

    questId: integer('quest_id').references(() => quests.id, { onDelete: 'cascade' }),

    modId: integer('mod_id').references(() => mods.id, { onDelete: 'cascade' }),
})
