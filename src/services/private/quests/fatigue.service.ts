import { Skillset } from '@/config/seeds/skillsets-seed'
import { UserModel } from '@/models/user.model'

const userFatigueService = (userModel: UserModel) => ({
    async rerollSkillset(userId: number, skillset: Skillset) {
        const userFatigue = (await userModel.getFatigue(userId))[0]
        return userFatigue[skillset] > 0 && this.rollSkillset(userFatigue[skillset]);
    },

    rollSkillset(chance: number) {
        const random = Math.random() * 100
        return random < chance
    }
})

export type ForwardOrRerollSkillsetFunc = ReturnType<
    typeof userFatigueService
>['rerollSkillset']

export default userFatigueService
