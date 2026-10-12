import type { UserCountry } from '@/shared/types/api-responses/user.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type OsuUserExtracted = {
    id: number
    username: string
    avatar_url: string
    country: UserCountry
    pp: number
}

export type SharedSkillsets = {
    skillset: Skillset
    share: number
}[]
