import { mapCalculatedBeatmap } from '@/services/osu/beatmaps-mapper.service'

export type OsuAuthToken = {
    token: string
    expiresIn: number
    refreshToken: string
}

export type OsuCodeGrantTokenResponse = {
    access_token: string
    expires_in: number
    refresh_token: string
    token_type: string
}

type UserCountry = {
    code: string
    name: string
}

//osu api '/me' contains a lot of fields, but currently we need only these
export type OsuApiUser = {
    id: number
    username: string
    avatar_url: string
    country: UserCountry
    statistics: {
        pp: number
    }
}

export type OsuCredentialTokenResponse = {
    access_token: string
    expires_in: number
    token_type: string
}

export type OsuUserExtracted = {
    id: number
    username: string
    avatar_url: string
    country: UserCountry
    pp: number
}

export type DBUser = {
    id: number
    osu_id: number
    name: string
    avatar_url: string | null
    pp: number
    country: UserCountry
    created_at: Date
}

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
    status: string
    difficulty_rating: number
    bpm: number
    max_combo: number
    ar: number
    cs: number
    accuracy: number
    drain: number
}

export type MapsetBeatmap = Omit<MappedBeatmap, 'accuracy' | 'difficulty_rating' | 'max_combo' | 'drain'> & {
    stars: number
    od: number
    hp: number
    combo: number
}

export type OsuPerformanceAttributes = {
    difficulty: OsuPerformanceDifficulty
    pp: number
    ppAim: number
    ppSpeed: number
    ppAccuracy: number

    speedDeviation: number
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

export type MappedPerformanceAttributes = ReturnType<
    typeof mapCalculatedBeatmap
>

export type BeatmapsSearchExtraCondition = {
    field: string
    condition: string
    value: string | number
}[]
