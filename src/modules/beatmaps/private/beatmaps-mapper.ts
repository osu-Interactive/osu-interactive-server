import { pickFields, renameKeys } from '@/utils/object'

import type { PerformanceAttributes } from 'rosu-pp-js'
import type {
    ExtractedBeatmap,
    Mapset,
    MapsetBeatmap,
    RosuPerformanceAttributes,
    RosuPerformanceDifficulty,
} from '../beatmaps.types'
import type { Beatmap as RawBeatmap, Mapset as RawMapset } from '@/shared/types/api-responses/mapset.types'

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

class BeatmapsMapper {
    public static mapMapset(rawMapset: RawMapset): Mapset {
        return {
            ...pickFields(rawMapset, allowedMapsetFields),
            beatmaps: Array.isArray(rawMapset.beatmaps)
                ? rawMapset.beatmaps.map((beatmap) => this.mapMapsetBeatmap(beatmap))
                : [],
        }
    }

    public static mapMapsetBeatmap(rawBeatmap: RawBeatmap): MapsetBeatmap {
        const beatmap: ExtractedBeatmap = {
            ...pickFields(rawBeatmap, allowedBeatmapFields),
            mapset_id: rawBeatmap.beatmapset_id,
            difficulty_rating: this.round(rawBeatmap.difficulty_rating, 2),
            max_combo: rawBeatmap.max_combo ?? 0,
        }

        return this.renameBeatmap(beatmap)
    }

    private static renameBeatmap(beatmap: ExtractedBeatmap): MapsetBeatmap {
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

    public static mapCalculatedBeatmap(rawBeatmap: PerformanceAttributes): RosuPerformanceAttributes {
        const beatmap = <RosuPerformanceAttributes>(
            pickFields(rawBeatmap, allowedCalculatedBeatmapFields, this.roundFloat)
        )

        beatmap.difficulty = <RosuPerformanceDifficulty>(
            pickFields(rawBeatmap.difficulty, allowedDifficultyFields, this.roundFloat)
        )

        return beatmap
    }

    private static roundFloat(value: unknown) {
        return typeof value === 'number' && !Number.isInteger(value)
            ? BeatmapsMapper.round(value, 4)
            : value
    }

    private static round(value: number, digits: number) {
        const factor = 10 ** digits
        return Math.round(value * factor) / factor
    }
}

export default BeatmapsMapper
