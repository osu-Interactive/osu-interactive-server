import { skillsetsSeed, type Skillset } from '@/config/seeds/skillsets-seed'
import type { UserModel } from '@/models/user.model'
import type { SharedSkillsets } from '@/types/osu.types'

export default (userModel: UserModel) => ({
    async initializePreferences(userId: number) {
        const skillsets: Skillset[] = skillsetsSeed.map(({ code }) => code)
        const shares = this.distributeBudgetEvenly(skillsets, 100)

        const sharedSkillsets: SharedSkillsets = skillsets.map((skillset, index) => ({
            skillset: skillset as Skillset,
            share: shares[index],
        }))

        await userModel.initializePreferences(userId, sharedSkillsets)
    },

    distributeBudgetEvenly(skillsets: Skillset[], total: number): number[] {
        const count = skillsets.length
        const totalCents = Math.round(total * 100)
        const baseShare = Math.floor(totalCents / count)
        const remainder = totalCents % count

        return Array.from({ length: count }, (_, index) => {
            return (baseShare + (index < remainder ? 1 : 0)) / 100
        })
    },
})
