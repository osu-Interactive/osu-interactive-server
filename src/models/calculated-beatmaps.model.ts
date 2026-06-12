import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import { MappedPerformanceAttributes } from '@/types/osu.types'
import { calculatedBeatmaps } from '@/db/schemas/schema'

export type CalculatedBeatmapsModel = ReturnType<typeof calculatedBeatmapsModel>

export const calculatedBeatmapsModel = (db: DBExecutor) => ({
    async setBeatmap(
        bm: MappedPerformanceAttributes,
        beatmapId: number,
        mapsetId: number,
    ) {
        const difficulty = bm.difficulty

        const values = {
            stars: difficulty.stars,
            is_convert: difficulty.isConvert,

            aim: difficulty.aim,
            aim_difficult_slider_count: difficulty.aimDifficultSliderCount,

            speed: difficulty.speed,

            slider_factor: difficulty.sliderFactor,

            aim_top_weighted_slider_factor:
            difficulty.aimTopWeightedSliderFactor,

            speed_top_weighted_slider_factor:
            difficulty.speedTopWeightedSliderFactor,

            speed_note_count: difficulty.speedNoteCount,

            aim_difficult_strain_count: difficulty.aimDifficultStrainCount,

            speed_difficult_strain_count:
            difficulty.speedDifficultStrainCount,

            nested_score_per_object: difficulty.nestedScorePerObject,

            legacy_score_base_multiplier:
            difficulty.legacyScoreBaseMultiplier,

            maximum_legacy_combo_score: difficulty.maximumLegacyComboScore,

            hp: difficulty.hp,

            n_circles: difficulty.nCircles,
            n_sliders: difficulty.nSliders,
            n_large_ticks: difficulty.nLargeTicks,
            n_spinners: difficulty.nSpinners,

            ar: difficulty.ar,

            great_hit_window: difficulty.greatHitWindow,

            max_combo: difficulty.maxCombo,

            pp: bm.pp,
            pp_aim: bm.ppAim,
            pp_speed: bm.ppSpeed,
            pp_accuracy: bm.ppAccuracy,

            speed_deviation: bm.speedDeviation,
        }

        return db.insert(calculatedBeatmaps).values({
            beatmap_id: beatmapId,
            mapset_id: mapsetId,

            ...values })
            .onConflictDoUpdate({
                target: calculatedBeatmaps.beatmap_id,
                set: values,
            })
            .returning()
    },
})
