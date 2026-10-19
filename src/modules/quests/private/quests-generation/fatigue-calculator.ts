import { Skillset } from '@/config/seeds/skillsets-seed'
import type { UserFatigue } from '../../quests.types'

class FatigueCalculator {
    shouldRerollSkillset(userFatigue: UserFatigue, skillset: Skillset) {
        return userFatigue[skillset] > 0 && this.rollSkillset(userFatigue[skillset])
    }

    rollSkillset(chance: number) {
        const random = Math.random() * 100
        return random < chance
    }
}

export default FatigueCalculator
