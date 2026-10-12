import { Skillset } from '@/config/seeds/skillsets-seed'
import type UserRepository from '@/modules/user/user.repository'

class Fatigue {
    constructor(private readonly userRepository: UserRepository) {}

    async rerollSkillset(userId: number, skillset: Skillset) {
        const userFatigue = (await this.userRepository.getFatigue(userId))[0]
        return userFatigue[skillset] > 0 && this.rollSkillset(userFatigue[skillset])
    }

    rollSkillset(chance: number) {
        const random = Math.random() * 100
        return random < chance
    }
}

export default Fatigue
