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
import { mapsets, mapsetsBeatmaps } from '@/db/schemas/schema'

export const calculatedBeatmaps = pgTable(
    'calculated_beatmaps',
    {
        id: serial('id').primaryKey(),

        beatmapId: integer('beatmap_id')
            .notNull()
            .references(() => mapsetsBeatmaps.id, {
                onDelete: 'cascade',
            })
            .unique(),

        mapsetId: integer('mapset_id')
            .notNull()
            .references(() => mapsets.id, {
                onDelete: 'cascade',
            }),

        //difficulty

        stars: doublePrecision('stars').notNull(),
        isConvert: boolean('is_convert').notNull(),

        aim: doublePrecision('aim').notNull(),
        aimDifficultSliderCount: doublePrecision('aim_difficult_slider_count').notNull(),

        speed: doublePrecision('speed').notNull(),

        sliderFactor: doublePrecision('slider_factor').notNull(),

        aimTopWeightedSliderFactor: doublePrecision('aim_top_weighted_slider_factor').notNull(),

        speedTopWeightedSliderFactor: doublePrecision('speed_top_weighted_slider_factor').notNull(),

        speedNoteCount: doublePrecision('speed_note_count').notNull(),

        aimDifficultStrainCount: doublePrecision('aim_difficult_strain_count').notNull(),

        speedDifficultStrainCount: doublePrecision('speed_difficult_strain_count').notNull(),

        nestedScorePerObject: doublePrecision('nested_score_per_object').notNull(),

        legacyScoreBaseMultiplier: doublePrecision('legacy_score_base_multiplier').notNull(),

        maximumLegacyComboScore: integer('maximum_legacy_combo_score').notNull(),

        hp: real('hp').notNull(),

        nCircles: integer('n_circles').notNull(),
        nSliders: integer('n_sliders').notNull(),
        nLarge_ticks: integer('n_large_ticks').notNull(),
        nSpinners: integer('n_spinners').notNull(),

        ar: real('ar').notNull(),

        greatHitWindow: doublePrecision('great_hit_window').notNull(),

        maxCombo: integer('max_combo').notNull(),

        // pp

        pp: doublePrecision('pp').notNull(),
        ppAim: doublePrecision('pp_aim').notNull(),
        ppSpeed: doublePrecision('pp_speed').notNull(),
        ppAccuracy: doublePrecision('pp_accuracy').notNull(),

        speedDeviation: doublePrecision('speed_deviation').notNull(),

        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [index('calculated_beatmaps_id_idx').on(table.mapsetId)],
)
