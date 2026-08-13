import type { UserModel } from '@/models/user.model'
import type { TagsModel } from '@/models/tags.model'
import questsConfig from '@/config/quests.config'

export default (userModel: UserModel, tagsModel: TagsModel) => ({
    async initializePreferences() {
        const skillsets = await tagsModel.getSkillsets()
        const codes = skillsets.map((skillset) => skillset.code)

        const shares = this.distributeBudget(questsConfig.preferenceBudget, codes.length)

        const sharedSkillsets = codes.map((skillset, index) => ({
            skillset,
            share: shares[index],
        }))

        console.log(sharedSkillsets)
        await userModel.initializePreferences(1, sharedSkillsets)
    },

    distributeBudget(total: number, count: number): number[] {
        const totalCents = Math.round(total * 100)
        const baseShare = Math.floor(totalCents / count)
        const remainder = totalCents % count

        return Array.from({ length: count }, (_, index) => {
            return (baseShare + (index < remainder ? 1 : 0)) / 100
        })
    },
})
