export interface Mapset {
    anime_cover: boolean
    artist: string
    artist_unicode: string
    covers: Covers
    creator: string
    favourite_count: number
    genre_id: number
    hype: Hype | null
    id: number
    language_id: number
    nsfw: boolean
    offset: number
    play_count: number
    preview_url: string
    source: string
    spotlight: boolean
    status: BeatmapRankStatus
    title: string
    title_unicode: string
    track_id: number | null
    user_id: number
    video: boolean
    bpm: number
    can_be_hyped: boolean
    deleted_at: string | null
    discussion_enabled: boolean
    discussion_locked: boolean
    is_scoreable: boolean
    last_updated: string
    legacy_thread_url: string
    nominations_summary: NominationsSummary
    ranked: number
    ranked_date: string
    rating: number
    storyboard: boolean
    submitted_date: string
    tags: string
    availability: Availability

    beatmaps: Beatmap[]
    converts: Beatmap[]

    current_nominations: CurrentNomination[]
    description: Description

    genre: Genre
    language: Language

    pack_tags: string[]
    ratings: number[]

    recent_favourites: User[]
    related_users: User[]
    related_tags: RelatedTag[]

    user: User

    version_count: number
}

export interface Covers {
    cover: string
    'cover@2x': string
    card: string
    'card@2x': string
    list: string
    'list@2x': string
    slimcover: string
    'slimcover@2x': string
}

export interface Hype {
    current: number
    required: number
}

export interface NominationsSummary {
    current: number
    eligible_main_rulesets: Ruleset[]
    required_meta: RequiredMeta
}

export interface RequiredMeta {
    main_ruleset: number
    non_main_ruleset: number
}

export interface Availability {
    download_disabled: boolean
    more_information: string | null
}

export interface Beatmap {
    beatmapset_id: number
    difficulty_rating: number
    id: number

    mode: Ruleset
    status: BeatmapRankStatus

    total_length: number
    user_id: number
    version: string

    accuracy: number
    ar: number
    bpm: number
    convert: boolean

    count_circles: number
    count_sliders: number
    count_spinners: number

    cs: number
    deleted_at: string | null
    drain: number

    hit_length: number
    is_scoreable: boolean
    last_updated: string

    mode_int: number

    passcount: number
    playcount: number

    ranked: number

    url: string
    checksum: string

    current_user_playcount?: number
    current_user_tag_ids?: number[]

    failtimes?: Failtimes
    max_combo?: number

    owners?: BeatmapOwner[]
    top_tag_ids?: number[]
}

export interface Failtimes {
    fail: number[]
    exit: number[]
}

export interface BeatmapOwner {
    id: number
    username: string
}

export interface CurrentNomination {
    beatmapset_id: number
    rulesets: Ruleset[] | null
    reset: boolean
    user_id: number
}

export interface Description {
    description: string
}

export interface Genre {
    id: number
    name: string
}

export interface Language {
    id: number
    name: string
}

export interface User {
    avatar_url: string
    country_code: string
    default_group: string

    id: number

    is_active: boolean
    is_bot: boolean
    is_deleted: boolean
    is_online: boolean
    is_supporter: boolean

    last_visit: string | null

    pm_friends_only: boolean
    profile_colour: string | null

    username: string
}

export interface RelatedTag {
    id: number
    name: string
    ruleset_id: number
    description: string
    created_at: string | null
    updated_at: string | null
}

export type Ruleset = 'osu' | 'taiko' | 'fruits' | 'mania'

export type BeatmapRankStatus =
    | 'graveyard'
    | 'wip'
    | 'pending'
    | 'ranked'
    | 'approved'
    | 'qualified'
    | 'loved'
