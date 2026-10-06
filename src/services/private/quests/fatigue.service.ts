import { Skillset } from '@/config/seeds/skillsets-seed'
import { UserModel } from '@/models/user.model'

class FatigueService {
    constructor(private readonly userModel: UserModel) {}

    async rerollSkillset(userId: number, skillset: Skillset) {
        const userFatigue = (await this.userModel.getFatigue(userId))[0]
        return userFatigue[skillset] > 0 && this.rollSkillset(userFatigue[skillset])
    }

    rollSkillset(chance: number) {
        const random = Math.random() * 100
        return random < chance
    }
}

export type ForwardOrRerollSkillsetFunc = FatigueService['rerollSkillset']

export default FatigueService
