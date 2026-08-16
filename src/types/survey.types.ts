import { Skillset } from '@/config/seeds/skillsets-seed'

export type SurveyResult = {
    skillsetsCodes: Skillset[]
    //TODO: Implement mods types
    modsCodes: string[]
}
