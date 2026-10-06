import { modsSeed } from '@/config/seeds/mods-seed'
import { skillsetsSeed } from '@/config/seeds/skillsets-seed'
import type { TagsModel } from '@/models/tags.model'

class TagsService {
    constructor(private readonly tagsModel: TagsModel) {}

    getMods() {
        return this.tagsModel.getMods()
    }

    getSkillsets() {
        return this.tagsModel.getSkillsets()
    }

    async initMods() {
        const modNames = Object.values(modsSeed).map(({ name, code }) => ({
            name,
            code,
        }))
        await this.tagsModel.replaceMods(modNames)
    }

    async initSkillsets() {
        const skillsetsNames = Object.values(skillsetsSeed).map(
            ({ name, code, surveyDescription }) => ({
                name,
                code,
                surveyDescription,
            }),
        )

        await this.tagsModel.replaceSkillsets(skillsetsNames)
    }
}

export default TagsService
