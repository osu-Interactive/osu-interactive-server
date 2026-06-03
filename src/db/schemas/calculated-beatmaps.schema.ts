import {
    pgTable,
    index,
    serial,
    integer,
    real,
    boolean,
    timestamp,
    doublePrecision,
} from 'drizzle-orm/pg-core'
import { mapsets } from '@/db/schemas/mapsets.schema'

export const calculatedBeatmaps = pgTable(
    'calculated_beatmaps',
    {
        id: serial('id').primaryKey(),

        beatmap_id: integer('beatmap_id').notNull().unique(),

        mapset_id: integer('mapset_id')
            .notNull()
            .references(() => mapsets.mapset_id, {
                onDelete: 'cascade',
            }),

        //difficulty

        stars: doublePrecision('stars').notNull(),
        is_convert: boolean('is_convert').notNull(),

        aim: doublePrecision('aim').notNull(),
        aim_difficult_slider_count: doublePrecision(
            'aim_difficult_slider_count',
        ).notNull(),

        speed: doublePrecision('speed').notNull(),

        slider_factor: doublePrecision('slider_factor').notNull(),

        aim_top_weighted_slider_factor: doublePrecision(
            'aim_top_weighted_slider_factor',
        ).notNull(),

        speed_top_weighted_slider_factor: doublePrecision(
            'speed_top_weighted_slider_factor',
        ).notNull(),

        speed_note_count: doublePrecision('speed_note_count').notNull(),

        aim_difficult_strain_count: doublePrecision(
            'aim_difficult_strain_count',
        ).notNull(),

        speed_difficult_strain_count: doublePrecision(
            'speed_difficult_strain_count',
        ).notNull(),

        nested_score_per_object: doublePrecision(
            'nested_score_per_object',
        ).notNull(),

        legacy_score_base_multiplier: doublePrecision(
            'legacy_score_base_multiplier',
        ).notNull(),

        maximum_legacy_combo_score: integer(
            'maximum_legacy_combo_score',
        ).notNull(),

        hp: real('hp').notNull(),

        n_circles: integer('n_circles').notNull(),
        n_sliders: integer('n_sliders').notNull(),
        n_large_ticks: integer('n_large_ticks').notNull(),
        n_spinners: integer('n_spinners').notNull(),

        ar: real('ar').notNull(),

        great_hit_window: doublePrecision('great_hit_window').notNull(),

        max_combo: integer('max_combo').notNull(),

        // pp

        pp: doublePrecision('pp').notNull(),
        pp_aim: doublePrecision('pp_aim').notNull(),
        pp_speed: doublePrecision('pp_speed').notNull(),
        pp_accuracy: doublePrecision('pp_accuracy').notNull(),

        speed_deviation: doublePrecision('speed_deviation').notNull(),

        created_at: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('calculated_beatmaps_id_idx').on(table.mapset_id)],
)
