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
            isConvert: difficulty.isConvert,

            aim: difficulty.aim,
            aimDifficultSliderCount: difficulty.aimDifficultSliderCount,

            speed: difficulty.speed,

            sliderFactor: difficulty.sliderFactor,

            aimTopWeightedSliderFactor:
            difficulty.aimTopWeightedSliderFactor,

            speedTopWeightedSliderFactor:
            difficulty.speedTopWeightedSliderFactor,

            speedNoteCount: difficulty.speedNoteCount,

            aimDifficultStrainCount: difficulty.aimDifficultStrainCount,

            speedDifficultStrainCount:
            difficulty.speedDifficultStrainCount,

            nestedScorePerObject: difficulty.nestedScorePerObject,

            legacyScoreBaseMultiplier:
            difficulty.legacyScoreBaseMultiplier,

            maximumLegacyComboScore: difficulty.maximumLegacyComboScore,

            hp: difficulty.hp,

            nCircles: difficulty.nCircles,
            nSliders: difficulty.nSliders,
            nLarge_ticks: difficulty.nLargeTicks,
            nSpinners: difficulty.nSpinners,

            ar: difficulty.ar,

            greatHitWindow: difficulty.greatHitWindow,

            maxCombo: difficulty.maxCombo,

            pp: bm.pp,
            ppAim: bm.ppAim,
            ppSpeed: bm.ppSpeed,
            ppAccuracy: bm.ppAccuracy,

            speedDeviation: bm.speedDeviation,
        }

        return db.insert(calculatedBeatmaps).values({
            beatmapId: beatmapId,
            mapsetId: mapsetId,

            ...values })
            .onConflictDoUpdate({
                target: calculatedBeatmaps.beatmapId,
                set: values,
            })
            .returning()
    },
})
