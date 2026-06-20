import { integer, pgTable, serial } from 'drizzle-orm/pg-core'
import { quests, skillsets } from './schema'

export const questSkillsetsSchema = pgTable('quest_skillsets', {
    id: serial('id').primaryKey(),

    questId: integer('quest_id').references(() => quests.id, { onDelete: 'cascade' }),

    skillsetId: integer('skillset_id').references(() => skillsets.id, { onDelete: 'cascade' }),
})
