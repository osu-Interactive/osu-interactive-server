import type { UserCountry } from '@/shared/types/api-responses/user.types'
import type { Skillset } from '@/config/seeds/skillsets-seed'

export type OsuUserExtracted = {
    id: number
    username: string
    avatar_url: string
    country: UserCountry
    pp: number
}

export type SkillsetsShares = {
    skillset: Skillset
    share: number
}[]
