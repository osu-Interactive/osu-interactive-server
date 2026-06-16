import { modsSeed } from '@/config/mods-seed'
import { skillsetsSeed } from '@/config/skillsets-seed'
import type { TagsModel } from '@/models/tags.model'

export default (tagsModel: TagsModel) => ({
    getMods() {
        return tagsModel.getMods()
    },

    getSkillsets() {
        return tagsModel.getSkillsets()
    },

    async setMods() {
        const modNames = Object.entries(modsSeed).map(([code, value]) => ({
            code,
            name: value.name,
        }))
        await tagsModel.setMods(modNames)

        console.log(`[Tags] Loaded ${modNames.length} mods`)
    },

    async setSkillsets() {
        const skillsetsNames = Object.entries(skillsetsSeed).map(([code, value]) => ({
            code,
            name: value.name,
            surveyDescription: value.surveyDescription,
        }))

        await tagsModel.setSkillsets(skillsetsNames)

        console.log(`[Tags] Loaded ${skillsetsNames.length} skillsets`)
    }
})
