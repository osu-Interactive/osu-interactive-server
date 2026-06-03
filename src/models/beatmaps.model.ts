import { sql } from 'drizzle-orm'
import { mapsets, mapsetsBeatmaps } from '../db/schemas/schema'
import type { DB } from '@/types/drizzle-pg-db.types'
import type { Mapset } from '@/types/osu.types'

export type BeatmapsModel = ReturnType<typeof beatmapsModel>

const toDate = (value: string | null): Date | null => {
    return value ? new Date(value) : null
}

export const beatmapsModel = (db: DB) => ({
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
})
