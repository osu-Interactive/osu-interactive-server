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

//osu api '/me' contains a lot of fields, but currently we need only these
export type OsuApiUser = {
    id: number
    username: string
    avatar_url: string
    country: {
        code: string
        name: string
    }
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
    country: {
        code: string
        name: string
    }
    pp: number
}
