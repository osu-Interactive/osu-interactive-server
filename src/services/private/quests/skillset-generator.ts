import BudgetHelperService from '@/services/private/quests/budget-helper.service'
import type { UserSkillsetsPreferences } from '@/types/osu.types'
import type { ForwardOrRerollSkillsetFunc } from '@/services/private/quests/fatigue.service'

type OptionalUserSkillsetsPreferences = Partial<UserSkillsetsPreferences>

const log = false

class SkillsetGenerator {
    private readonly budgetHelperService = new BudgetHelperService()

    async getSkillset(
        userId: number,
        userPreferences: UserSkillsetsPreferences,
        forwardOrRerollSkillset: ForwardOrRerollSkillsetFunc,
    ) {
        let preferences: OptionalUserSkillsetsPreferences = userPreferences
        let skillset = this.weightedRandom(preferences)

        let reroll = await forwardOrRerollSkillset(userId, skillset)

        while (reroll) {
            log && console.log(`${skillset} was selected, but will be rerolled due to fatigue`)
            preferences = this.removeSkillsetFromPreferences(preferences, skillset)

            if (Object.keys(preferences).length === 0) {
                console.warn(
                    'No skillsets left in preferences. Continue with fallback with any random skillset',
                )

                return this.weightedRandom(userPreferences)
            }

            preferences = this.budgetHelperService.normalizeTo100(preferences)
            skillset = this.weightedRandom(preferences)

            reroll = await forwardOrRerollSkillset(userId, skillset)
        }

        log && console.log(`Accepted skillset: ${skillset}`)

        return skillset
    }

    removeSkillsetFromPreferences(
        preferences: OptionalUserSkillsetsPreferences,
        skillset: keyof OptionalUserSkillsetsPreferences,
    ): OptionalUserSkillsetsPreferences {
        const previousLength = Object.keys(preferences).length

        const { [skillset]: _, ...preferencesWithoutSkillset } = preferences

        const newLength = Object.keys(preferencesWithoutSkillset).length

        if (newLength !== previousLength - 1) {
            throw new Error('Error while discarding skillset from preferences')
        }

        return preferencesWithoutSkillset
    }

    weightedRandom<T extends Record<string, number>>(weights: T): keyof T {
        const random = Math.random() * 100
        let cumulative = 0

        for (const [item, chance] of Object.entries(weights)) {
            cumulative += chance

            if (random < cumulative) {
                return item as keyof T
            }
        }

        throw new Error('Weights must sum to 100')
    }
}

export default SkillsetGenerator
