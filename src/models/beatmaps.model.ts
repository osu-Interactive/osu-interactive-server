import {
    and,
    eq,
    isNotNull,
    isNull,
    sql,
    asc,
    gte,
    getTableColumns,
} from 'drizzle-orm'
import {
    calculatedBeatmaps,
    mapsets,
    mapsetsBeatmaps,
    nonexistentMapsets,
    beatmapSkillsets,
} from '../db/schemas/schema'

import { AppError } from '@/errors/app-error'
import type { DBExecutor } from '@/types/drizzle-pg-db.types'

import type {
    SQLSearchConditions,
    Mapset,
    MapsetBeatmap,
    BeatmapSkillsets,
} from '@/types/osu.types'

export type BeatmapsModel = ReturnType<typeof beatmapsModel>

const toDate = (value: string | null): Date | null => {
    return value ? new Date(value) : null
}

export const beatmapsModel = (db: DBExecutor) => ({
    async setMapset(data: Mapset) {
        const values = {
            status: data.status,
            ranked_date: toDate(data.ranked_date),
            submitted_date: new Date(data.submitted_date),
            bpm: Math.round(data.bpm),
            title: data.title,
            artist: data.artist,
            creator: data.creator,
        }

        return db.transaction(async (tx) => {
            const [mapset] = await tx
                .insert(mapsets)
                .values({
                    mapsetId: data.id,
                    ...values,
                })
                .onConflictDoUpdate({
                    target: mapsets.mapsetId,
                    set: values,
                })
                .returning()

            if (data.beatmaps.length > 0) {
                await this.setMapsetsBeatmaps(
                    tx,
                    data.beatmaps,
                    data.id,
                    data.status,
                )
            }

            return mapset
        })
    },

    // prettier-ignore
    async setMapsetsBeatmaps(db: DBExecutor, beatmaps: MapsetBeatmap[], mapsetId: number, status: string) {
        const BEATMAP_COLUMNS = ['mapset_id', 'mode', 'status', 'stars', 'bpm', 'combo', 'ar', 'cs', 'od', 'hp'] as const

        await db
            .insert(mapsetsBeatmaps)
            .values(beatmaps.map(({ id, mode, stars, bpm, combo, ar, cs, od, hp }) => ({
                beatmap_id: id,
                mapset_id: mapsetId,
                mode, status, stars, bpm, combo, ar, cs, od, hp,
            })))
            .onConflictDoUpdate({
                target: mapsetsBeatmaps.beatmap_id,
                set: Object.fromEntries(
                    BEATMAP_COLUMNS.map((col) => [col, sql.raw(`excluded.${col}`)]),
                ),
            })
    },

    setNonexistentMapset(id: number) {
        return db
            .insert(nonexistentMapsets)
            .values({ mapsetId: id })
            .onConflictDoNothing()
            .returning()
    },

    async getBeatmaps(
        limit: number | null = null,
        startId: number = 1,
        extraConditions: SQLSearchConditions | null = null,
    ) {
        const conditions = this.buildFieldsConditions(
            'mapsets_beatmaps',
            extraConditions,
        )

        conditions.push(gte(mapsetsBeatmaps.beatmap_id, startId))

        const query = db
            .select({
                id: mapsetsBeatmaps.id,
            })
            .from(mapsetsBeatmaps)
            .where(and(...conditions))
            .orderBy(asc(mapsetsBeatmaps.beatmap_id))

        return limit !== null ? query.limit(limit) : query
    },

    async getBeatmapsByCalculationStatus(
        isCalculated: boolean,
        limit: number | null = null,
        startId: number = 1,
        extraConditions: SQLSearchConditions | null = null,
    ) {
        const conditions = this.buildFieldsConditions(
            'mapsets_beatmaps',
            extraConditions,
        )

        conditions.push(
            isCalculated
                ? isNotNull(calculatedBeatmaps.beatmapId)
                : isNull(calculatedBeatmaps.beatmapId),

            gte(mapsetsBeatmaps.beatmap_id, startId),
        )

        const query = db
            .select({
                beatmap_id: mapsetsBeatmaps.beatmap_id,
                mapset_id: mapsetsBeatmaps.mapset_id,
            })
            .from(mapsetsBeatmaps)
            .leftJoin(
                calculatedBeatmaps,
                eq(mapsetsBeatmaps.beatmap_id, calculatedBeatmaps.beatmapId),
            )

            .where(and(...conditions, isNotNull(mapsetsBeatmaps.combo)))
            .orderBy(asc(mapsetsBeatmaps.beatmap_id))

        return limit !== null ? query.limit(limit) : query
    },

    buildFieldsConditions(
        tableName: string,
        fieldsConditions: SQLSearchConditions | null = null,
    ) {
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
})
