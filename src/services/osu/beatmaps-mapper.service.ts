import type { Mapset as RawMapset, Beatmap as RawBeatmap } from '@/types/api-responses/raw-mapset.types'

export type Mapset = {
    id?: number
    beatmaps?: Beatmap[]
    status?: string
    ranked_date?: string
    submitted_date?: string
    bpm?: number
    title?: string
    creator?: string
    date?: string
}

export type Beatmap = {
    accuracy?: number
    ar?: number
    bpm?: number
    cs?: number
    difficulty_rating?: number
    drain?: number
    id?: number
    max_combo?: number
    mode?: string
}

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

const mapBeatmap = (rawBeatmap: RawBeatmap): Beatmap => {
    const beatmap = pickFields<Beatmap>(rawBeatmap, allowedFieldsBeatmap)

    if (typeof beatmap.difficulty_rating === 'number') {
        beatmap.difficulty_rating = normalizeDifficultyRating(
            beatmap.difficulty_rating,
        )
    }

    return beatmap
}

const filterBeatmapsetDate = (beatmapset: Mapset): Mapset => {
    beatmapset.date =
        beatmapset.ranked_date ||
        beatmapset.submitted_date ||
        new Date().toISOString()

    delete beatmapset.ranked_date
    delete beatmapset.submitted_date

    return beatmapset
}

export const mapMapset = (rawMapset: RawMapset): Mapset => {
    const mapset = pickFields<Mapset>(rawMapset, allowedFields)

    if (Array.isArray(mapset.beatmaps)) {
        mapset.beatmaps = mapset.beatmaps.map((beatmap) =>
            mapBeatmap(beatmap as RawBeatmap),
        )
    }

    return filterBeatmapsetDate(mapset)
}
