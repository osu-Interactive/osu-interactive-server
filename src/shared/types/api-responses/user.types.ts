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

export type UserCountry = {
    code: string
    name: string
}

