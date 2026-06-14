import type {
    MappedBeatmap,
    Mapset,
    MapsetBeatmap,
    OsuPerformanceAttributes,
    OsuPerformanceDifficulty
} from '@/types/osu.types'

import type { Beatmap as RawBeatmap, Mapset as RawMapset } from '@/types/api-responses/raw-mapset.types'

import type { PerformanceAttributes } from 'rosu-pp-js'

const allowedMapsetFields = [
    'id',
    'artist',
    'beatmaps',
    'status',
    'ranked_date',
    'submitted_date',
    'bpm',
    'title',
    'creator',
] as const

const allowedBeatmapFields = [
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

const allowedCalculatedBeatmapFields = [
    'difficulty',
    'pp',
    'ppAim',
    'ppSpeed',
    'ppAccuracy',

    'speedDeviation',
] as const

const allowedDifficultyFields = [
    'stars',
    'isConvert',

    'aim',
    'aimDifficultSliderCount',
    'speed',

    'sliderFactor',
    'aimTopWeightedSliderFactor',
    'speedTopWeightedSliderFactor',

    'speedNoteCount',
    'aimDifficultStrainCount',
    'speedDifficultStrainCount',

    'nestedScorePerObject',
    'legacyScoreBaseMultiplier',
    'maximumLegacyComboScore',

    'hp',
    'nCircles',
    'nSliders',
    'nLargeTicks',
    'nSpinners',

    'ar',
    'greatHitWindow',
    'maxCombo',
] as const

export const mapMapset = (rawMapset: RawMapset): Mapset => {
    const mapset = pickFields<Mapset>(rawMapset, allowedMapsetFields)

    if (Array.isArray(rawMapset.beatmaps)) {
        mapset.beatmaps = rawMapset.beatmaps.map(mapMapsetBeatmap)
    }

    return mapset
}

export const mapMapsetBeatmap = (rawBeatmap: RawBeatmap): MapsetBeatmap => {
    const beatmap = pickFields<MappedBeatmap>(rawBeatmap, allowedBeatmapFields)

    beatmap.mapset_id = rawBeatmap.beatmapset_id
    beatmap.difficulty_rating = round(beatmap.difficulty_rating, 2)

    return renameBeatmap(beatmap)
}

const renameBeatmap = (beatmap: MappedBeatmap): MapsetBeatmap => {
    return renameKeys(beatmap, {
        difficulty_rating: 'stars',
        accuracy: 'od',
        drain: 'hp',
        max_combo: 'combo',
    }) as MapsetBeatmap
}

/**
 * Note: The object with type PerformanceAttributes is a WASM-backed object, not a plain JavaScript object.
 *
 * Most properties are exposed through prototype getters and are not enumerable,
 * so Object.keys(), Object.values(), spread syntax, and similar operations may
 * not behave as expected. Use the provided getters or toJSON() instead.
 */

export const mapCalculatedBeatmap = (
    rawBeatmap: PerformanceAttributes,
): OsuPerformanceAttributes => {
    const beatmap = <OsuPerformanceAttributes>(
        pickFields(rawBeatmap, allowedCalculatedBeatmapFields, roundFloat)
    )

    beatmap.difficulty = <OsuPerformanceDifficulty>(
        pickFields(rawBeatmap.difficulty, allowedDifficultyFields, roundFloat)
    )

    return beatmap
}

// Keeps only fields from the allowlist and returns a shallow copy.
type ValueMapper = (value: unknown) => unknown

const pickFields = <T extends object>(
    obj: any,
    fields: readonly string[],
    mapValue: ValueMapper = (value) => value,
): T => {
    const result: Record<string, unknown> = {}

    for (const field of fields) {
        if (field in obj) {
            result[field] = mapValue(obj[field])
        }
    }

    return result as T
}

function renameKeys<
    T extends Record<string, any>,
    R extends Record<string, string>
>(
    obj: T,
    mapping: R,
) {
    const result: Record<string, any> = {}

    for (const key in obj) {
        result[mapping[key] ?? key] = obj[key]
    }

    return result
}

const roundFloat = (value: unknown) =>
    typeof value === 'number' && !Number.isInteger(value)
        ? round(value, 4)
        : value

const round = (value: number, digits: number) => {
    const factor = 10 ** digits
    return Math.round(value * factor) / factor
}
