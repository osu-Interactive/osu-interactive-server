import type { Mapset, MapsetBeatmap } from '@/types/osu.types'
import type {
    Mapset as RawMapset,
    Beatmap as RawBeatmap,
} from '@/types/api-responses/raw-mapset.types'

const allowedFields = [
    'id',
    'beatmaps',
    'status',
    'ranked_date',
    'submitted_date',
    'bpm',
    'title',
    'creator',
] as const

const allowedFieldsBeatmap = [
    'accuracy',
    'ar',
    'bpm',
    'cs',
    'difficulty_rating',
    'drain',
    'id',
    'max_combo',
    'mode',
] as const

const pickFields = <T extends object>(
    obj: object,
    fields: readonly string[],
): T => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => fields.includes(key)),
    ) as T
}

const normalizeDifficultyRating = (value: number): number => {
    return Math.round(value * 100) / 100
}

const mapBeatmap = (rawBeatmap: RawBeatmap): MapsetBeatmap => {
    const beatmap = pickFields<MapsetBeatmap>(rawBeatmap, allowedFieldsBeatmap)

    beatmap.mapset_id = rawBeatmap.beatmapset_id
    beatmap.difficulty_rating = normalizeDifficultyRating(
        beatmap.difficulty_rating,
    )

    return beatmap
}

export const mapMapset = (rawMapset: RawMapset): Mapset => {
    const mapset = pickFields<Mapset>(rawMapset, allowedFields)

    if (Array.isArray(rawMapset.beatmaps)) {
        mapset.beatmaps = rawMapset.beatmaps.map(mapBeatmap)
    }

    return mapset
}
