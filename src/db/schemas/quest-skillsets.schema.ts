import { pgTable, serial } from 'drizzle-orm/pg-core'
import { quests, skillsets } from './schema'

export const questSkillsetsSchema = pgTable('quests_skillsets', {
    id: serial('id').primaryKey(),

    questId: serial('beatmap_id').references(() => quests.id, { onDelete: 'cascade' }),

    modId: serial('mods_id').references(() => skillsets.id, { onDelete: 'cascade' }),
})
