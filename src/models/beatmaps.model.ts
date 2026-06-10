import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import {
    calculatedBeatmaps,
    mapsets,
    mapsetsBeatmaps,
    nonexistentMapsets,
} from '../db/schemas/schema'
import { getTableColumns } from 'drizzle-orm'
import type { DBExecutor } from '@/types/drizzle-pg-db.types'
import type { BeatmapsSearchExtraCondition, Mapset } from '@/types/osu.types'
import { AppError } from '@/errors/app-error'

export type BeatmapsModel = ReturnType<typeof beatmapsModel>

const toDate = (value: string | null): Date | null => {
    return value ? new Date(value) : null
}

export const beatmapsModel = (db: DBExecutor) => ({
    async setMapset(data: Mapset) {
        return db.transaction(async (tx) => {
            const [mapset] = await tx
                .insert(mapsets)
                .values({
                    mapset_id: data.id,
                    status: data.status,
                    ranked_date: toDate(data.ranked_date),
                    submitted_date: new Date(data.submitted_date),
                    bpm: Math.round(data.bpm),
                    title: data.title,
                    creator: data.creator,
                })
                .onConflictDoUpdate({
                    target: mapsets.mapset_id,
                    set: {
                        status: data.status,
                        ranked_date: toDate(data.ranked_date),
                        submitted_date: new Date(data.submitted_date),
                        bpm: Math.round(data.bpm),
                        title: data.title,
                        creator: data.creator,
                    },
                })
                .returning()

            if (data.beatmaps.length > 0) {
                const beatmapRows = data.beatmaps.map((beatmap) => ({
                    beatmap_id: beatmap.id,
                    mapset_id: data.id,
                    status: data.status,
                    accuracy: beatmap.accuracy,
                    ar: beatmap.ar,
                    bpm: beatmap.bpm,
                    cs: beatmap.cs,
                    difficulty_rating: beatmap.difficulty_rating,
                    drain: beatmap.drain,
                    max_combo: beatmap.max_combo,
                    mode: beatmap.mode,
                }))

                await tx
                    .insert(mapsetsBeatmaps)
                    .values(beatmapRows)
                    .onConflictDoUpdate({
                        target: mapsetsBeatmaps.beatmap_id,
                        set: {
                            mapset_id: sql.raw('excluded.mapset_id'),
                            status: sql.raw('excluded.status'),
                            accuracy: sql.raw('excluded.accuracy'),
                            ar: sql.raw('excluded.ar'),
                            bpm: sql.raw('excluded.bpm'),
                            cs: sql.raw('excluded.cs'),
                            difficulty_rating: sql.raw(
                                'excluded.difficulty_rating',
                            ),
                            drain: sql.raw('excluded.drain'),
                            max_combo: sql.raw('excluded.max_combo'),
                            mode: sql.raw('excluded.mode'),
                        },
                    })
            }

            return mapset
        })
    },

    setNonexistentMapset(id: number) {
        return db
            .insert(nonexistentMapsets)
            .values({ mapset_id: id })
            .onConflictDoNothing()
            .returning()
    },

    async getBeatmapsBaseOnCalculation(
        calculated: boolean,
        extraConditions: BeatmapsSearchExtraCondition | null = null,
    ) {
        const conditions = this.getConditions(calculated, extraConditions)

        return db
            .select({
                beatmap_id: mapsetsBeatmaps.beatmap_id,
                mapset_id: mapsetsBeatmaps.mapset_id,
            })
            .from(mapsetsBeatmaps)
            .leftJoin(
                calculatedBeatmaps,
                eq(mapsetsBeatmaps.beatmap_id, calculatedBeatmaps.beatmap_id),
            )

            .where(and(...conditions, isNotNull(mapsetsBeatmaps.max_combo)))
    },

    getConditions(
        calculated: boolean,
        extraConditions: BeatmapsSearchExtraCondition | null = null,
    ) {
        const fieldWhitelist = Object.keys(getTableColumns(mapsetsBeatmaps))
        const conditionWhitelist = ['>', '>=', '=', '<=', '<', '!=']

        const conditions = [
            calculated
                ? isNotNull(calculatedBeatmaps.beatmap_id)
                : isNull(calculatedBeatmaps.beatmap_id),
        ]

        if (extraConditions !== null) {
            for (const condition of extraConditions) {
                if (
                    !fieldWhitelist.includes(condition.field) ||
                    !conditionWhitelist.includes(condition.condition)
                ) {
                    throw new AppError('Extra conditions are invalid', {
                        code: 'INVALID_EXTRA_CONDITIONS',
                    })
                }
                conditions.push(
                    sql`mapsets_beatmaps.
                    ${sql.raw(condition.field)}
                    ${sql.raw(condition.condition)}
                    ${condition.value}`,
                )
            }
        }

        return conditions
    },
})
