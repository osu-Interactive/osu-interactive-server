export type OsuRecentScores = {
    accuracy: number
    best_id: number | null
    created_at: string
    id: number
    max_combo: number
    mode: 'osu' | 'taiko' | 'fruits' | 'mania'
    mode_int: number
    mods: string[]
    passed: boolean
    perfect: boolean
    pp: number | null
    rank: string
    replay: boolean
    score: number
    statistics: {
        count_100: number
        count_300: number
        count_50: number
        count_geki: number | null
        count_katu: number | null
        count_miss: number
    }
    type: string
    user_id: number
    current_user_attributes: {
        pin: unknown | null
    }
    beatmap: {
        beatmapset_id: number
        difficulty_rating: number
        id: number
        mode: string
        status: string
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
    }
    beatmapset: {
        anime_cover: boolean
        artist: string
        artist_unicode: string
        covers: Record<string, string>
        creator: string
        favourite_count: number
        genre_id: number
        hype: unknown | null
        id: number
        language_id: number
        nsfw: boolean
        offset: number
        play_count: number
        preview_url: string
        source: string
        spotlight: boolean
        status: string
        title: string
        title_unicode: string
        track_id: number | null
        user_id: number
        video: boolean
    }
    user: {
        avatar_url: string
        country_code: string
        default_group: string
        id: number
        is_active: boolean
        is_bot: boolean
        is_deleted: boolean
        is_online: boolean
        is_supporter: boolean
        last_visit: string
        pm_friends_only: boolean
        profile_colour: string | null
        username: string
    }
}[]
