import { pgTable, serial } from 'drizzle-orm/pg-core'
import { quests, mods } from './schema'

export const questModsSchema = pgTable('quests_mods', {
    id: serial('id').primaryKey(),

    questId: serial('beatmap_id').references(
        () => quests.id,
        { onDelete: 'cascade' },
    ),

    modId: serial('mods_id').references(
        () => mods.id,
        { onDelete: 'cascade' },
    )
})
