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

    async initMods() {
        const modNames = Object.values(modsSeed).map(({ name, code }) => ({
            name,
            code,
        }))
        await tagsModel.replaceMods(modNames)
    },

    async initSkillsets() {
        const skillsetsNames = Object.values(skillsetsSeed).map(
            ({ name, code, surveyDescription }) => ({
                name,
                code,
                surveyDescription,
            }),
        )

        await tagsModel.replaceSkillsets(skillsetsNames)
    },
})
