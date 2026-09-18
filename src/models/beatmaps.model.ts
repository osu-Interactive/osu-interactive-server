import { and, eq, isNotNull, isNull, sql, asc, gte, getTableColumns } from 'drizzle-orm'
import {
    calculatedBeatmaps,
    mapsets,
    mapsetsBeatmaps,
    nonexistentMapsets,
    beatmapSkillsets,
} from '../db/schemas/schema'

import { AppError } from '@/errors/app-error'
import type { DBExecutor } from '@/types/drizzle-pg-db.types'

import {
    SQLSearchConditions,
    Mapset,
    MapsetBeatmap,
    BeatmapSkillsets,
    MappedPerformanceAttributes,
} from '@/types/osu.types'

export type BeatmapsModel = ReturnType<typeof beatmapsModel>

const toDate = (value: string | null): Date | null => {
    return value ? new Date(value) : null
}

export const beatmapsModel = (db: DBExecutor) => ({
    async setMapset(data: Mapset) {
        const values = {
            status: data.status,
            rankedDate: toDate(data.ranked_date),
            submittedDate: new Date(data.submitted_date),
            bpm: Math.round(data.bpm),
            title: data.title,
            artist: data.artist,
            creator: data.creator,
        }

        return db.transaction(async (tx) => {
            const [mapset] = await tx
                .insert(mapsets)
                .values({
                    id: data.id,
                    ...values,
                })
                .onConflictDoUpdate({
                    target: mapsets.id,
                    set: values,
                })
                .returning()

            if (data.beatmaps.length > 0) {
                await this.setMapsetsBeatmaps(tx, data.beatmaps, data.id, data.status)
            }

            return mapset
        })
    },

    // prettier-ignore
    setMapsetsBeatmaps(db: DBExecutor, beatmaps: MapsetBeatmap[], mapsetId: number, status: string) {
        /**
         * Note: Columns updated on conflict.
         * Drizzle schema property names must match the actual database column names.
         * Columns with different names (e.g. mapsetId -> mapset_id) must be specified manually in `set`.
         */
        const BEATMAP_COLUMNS = ['mode', 'status', 'stars', 'bpm', 'combo', 'ar', 'cs', 'od', 'hp'] as const

        return db
            .insert(mapsetsBeatmaps)
            .values(
                beatmaps.map(({ id, mode, stars, bpm, combo, ar, cs, od, hp }) => ({
                    id, mapsetId, mode, status, stars, bpm, combo, ar, cs, od, hp,
                })),
            )
            .onConflictDoUpdate({
                target: mapsetsBeatmaps.id,
                set: {
                    mapsetId: sql.raw('excluded.mapset_id'),
                    ...Object.fromEntries(
                        BEATMAP_COLUMNS.map((col) => [col, sql.raw(`excluded.${col}`)]),
                    ),
                },
            })
    },

    setNonexistentMapset(id: number) {
        return db
            .insert(nonexistentMapsets)
            .values({ osu_id: id })
            .onConflictDoNothing()
            .returning()
    },

    getBeatmaps(
        limit: number | null = null,
        startId: number = 1,
        extraConditions: SQLSearchConditions | null = null,
    ) {
        const conditions = this.buildFieldsConditions('mapsets_beatmaps', extraConditions)

        conditions.push(gte(mapsetsBeatmaps.id, startId))

        const query = db
            .select({
                id: mapsetsBeatmaps.id,
            })
            .from(mapsetsBeatmaps)
            .where(and(...conditions))
            .orderBy(asc(mapsetsBeatmaps.id))

        return limit !== null ? query.limit(limit) : query
    },

    getBeatmapsByCalculationStatus(
        isCalculated: boolean,
        limit: number | null = null,
        startId: number = 1,
        extraConditions: SQLSearchConditions | null = null,
    ) {
        const conditions = this.buildFieldsConditions('mapsets_beatmaps', extraConditions)

        conditions.push(
            isCalculated ? isNotNull(calculatedBeatmaps.id) : isNull(calculatedBeatmaps.id),

            gte(mapsetsBeatmaps.id, startId),
        )

        const query = db
            .select({
                beatmap_id: mapsetsBeatmaps.id,
                mapset_id: mapsetsBeatmaps.mapsetId,
            })
            .from(mapsetsBeatmaps)
            .leftJoin(calculatedBeatmaps, eq(mapsetsBeatmaps.id, calculatedBeatmaps.beatmapId))

            .where(and(...conditions, isNotNull(mapsetsBeatmaps.combo)))
            .orderBy(asc(mapsetsBeatmaps.id))

        return limit !== null ? query.limit(limit) : query
    },

    buildFieldsConditions(tableName: string, fieldsConditions: SQLSearchConditions | null = null) {
        const fieldsWhitelist = Object.keys(getTableColumns(mapsetsBeatmaps))
        const conditionWhitelist = ['>', '>=', '=', '<=', '<', '!=']

        const conditions: ReturnType<typeof sql>[] = []

        if (fieldsConditions !== null) {
            for (const condition of fieldsConditions) {
                if (
                    !fieldsWhitelist.includes(condition.field) ||
                    !conditionWhitelist.includes(condition.condition)
                ) {
                    throw new AppError('Extra conditions are invalid', {
                        code: 'INVALID_EXTRA_CONDITIONS',
                    })
                }
                conditions.push(
                    sql`
                        ${sql.raw(tableName)}.
                        ${sql.raw(condition.field)}
                        ${sql.raw(condition.condition)}
                        ${condition.value}`,
                )
            }
        }

        return conditions
    },

    setBeatmapSkillsets(beatmapId: number, skillsets: BeatmapSkillsets) {
        return db.insert(beatmapSkillsets).values({
            beatmapId,
            ...skillsets,
        })
    },

    setCalculatedBeatmap(bm: MappedPerformanceAttributes, beatmapId: number, mapsetId: number) {
        const difficulty = bm.difficulty

        const values = {
            stars: difficulty.stars,
            isConvert: difficulty.isConvert,

            aim: difficulty.aim,
            aimDifficultSliderCount: difficulty.aimDifficultSliderCount,

            speed: difficulty.speed,

            sliderFactor: difficulty.sliderFactor,

            aimTopWeightedSliderFactor: difficulty.aimTopWeightedSliderFactor,

            speedTopWeightedSliderFactor: difficulty.speedTopWeightedSliderFactor,

            speedNoteCount: difficulty.speedNoteCount,

            aimDifficultStrainCount: difficulty.aimDifficultStrainCount,

            speedDifficultStrainCount: difficulty.speedDifficultStrainCount,

            nestedScorePerObject: difficulty.nestedScorePerObject,

            legacyScoreBaseMultiplier: difficulty.legacyScoreBaseMultiplier,

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

        return db
            .insert(calculatedBeatmaps)
            .values({
                beatmapId,
                mapsetId,

                ...values,
            })
            .onConflictDoUpdate({
                target: calculatedBeatmaps.beatmapId,
                set: values,
            })
            .returning()
    },
})
