import type { Skillset } from '@/config/seeds/skillsets-seed'

const budgetHelperService = () => ({
    distributeBudgetByPriority(
        skillsets: Skillset[],
        total: number,
        prioritySkillsets: Skillset[] = [],
    ): { skillset: Skillset; share: number }[] {
        const totalCents = Math.round(total * 100)
        const prioritySet = new Set(prioritySkillsets)

        const weights = skillsets.map((skillset) => (prioritySet.has(skillset) ? 2 : 1))

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

        const shares = weights.map((weight) => Math.floor((totalCents * weight) / totalWeight))

        let remainder = totalCents - shares.reduce((sum, share) => sum + share, 0)

        for (let i = 0; remainder > 0; i++, remainder--) {
            shares[i]++
        }

        return skillsets.map((skillset, index) => ({
            skillset,
            share: shares[index] / 100,
        }))
    },

    normalizeTo100(values: Record<string, number>): Record<string, number> {
        const entries = Object.entries(values)
        const total = entries.reduce((sum, [, value]) => sum + value, 0)

        if (total === 0) {
            return Object.fromEntries(entries.map(([key]) => [key, 0]))
        }

        const normalized = entries.map(([key, value]) => {
            const exact = (value / total) * 100

            return {
                key,
                value: Math.floor(exact),
                remainder: exact - Math.floor(exact),
            }
        })

        let remainder = 100 - normalized.reduce((sum, item) => sum + item.value, 0)

        normalized.sort((a, b) => b.remainder - a.remainder)

        for (let i = 0; i < remainder; i++) {
            normalized[i].value++
        }

        return Object.fromEntries(normalized.map(({ key, value }) => [key, value]))
    },
})

export default budgetHelperService
