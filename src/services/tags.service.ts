import { modsSeed } from '@/config/seeds/mods-seed'
import { skillsetsSeed } from '@/config/seeds/skillsets-seed'
import type { TagsModel } from '@/models/tags.model'

export type TagsService = ReturnType<typeof createTagsService>

const createTagsService = (tagsModel: TagsModel) => ({
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

export default createTagsService
