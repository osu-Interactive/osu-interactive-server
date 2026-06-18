import { pgTable, serial, integer } from 'drizzle-orm/pg-core'
import { mapsetsBeatmaps } from './schema'

export const beatmapSkillsets = pgTable('beatmap_skillsets', {
    id: serial('id').primaryKey(),

    beatmapId: serial('beatmap_id').references(() => mapsetsBeatmaps.id, {
        onDelete: 'set null',
    }),

    jumps: integer('jumps').notNull(),
    streams: integer('streams').notNull(),
    fingerControl: integer('finger_control').notNull(),
    tech: integer('tech').notNull(),
    alt: integer('alt').notNull(),
    gimmick: integer('gimmick').notNull(),
})
