import type BeatmapsMapperService from '@/modules/beatmaps/private/beatmaps-mapper.service'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type Mapset = {
    id: number
    title: string
    artist: string
    creator: string
    beatmaps: MapsetBeatmap[]
    status: string
    ranked_date: string | null
    submitted_date: string
    bpm: number
}

export type MappedBeatmap = {
    id: number
    mapset_id: number
    mode: 'osu' | 'taiko' | 'fruits' | 'mania'
    difficulty_rating: number
    bpm: number
    max_combo: number
    ar: number
    cs: number
    accuracy: number
    drain: number
}

export type MapsetBeatmap = Omit<
    MappedBeatmap,
    'accuracy' | 'difficulty_rating' | 'max_combo' | 'drain'
> & {
    stars: number
    od: number
    hp: number
    combo: number
}

export type OsuPerformanceDifficulty = {
    stars: number
    isConvert: boolean

    aim: number
    aimDifficultSliderCount: number
    speed: number

    sliderFactor: number
    aimTopWeightedSliderFactor: number
    speedTopWeightedSliderFactor: number

    speedNoteCount: number
    aimDifficultStrainCount: number
    speedDifficultStrainCount: number

    nestedScorePerObject: number
    legacyScoreBaseMultiplier: number
    maximumLegacyComboScore: number

    hp: number
    nCircles: number
    nSliders: number
    nLargeTicks: number
    nSpinners: number

    ar: number
    greatHitWindow: number
    maxCombo: number
}

export type OsuPerformanceAttributes = {
    difficulty: OsuPerformanceDifficulty
    pp: number
    ppAim: number
    ppSpeed: number
    ppAccuracy: number

    speedDeviation: number
}

export type BeatmapSkillsets = {
    jumps: number
    streams: number
    fingerControl: number
    tech: number
    alternate: number
    gimmick: number
}

export type SQLSearchConditions = {
    field: string
    condition: string
    value: string | number
}[]

export type MappedPerformanceAttributes = ReturnType<
    typeof BeatmapsMapperService.mapCalculatedBeatmap
>
