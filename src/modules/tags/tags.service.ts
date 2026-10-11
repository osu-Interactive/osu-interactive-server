import { modsSeed } from '@/config/seeds/mods-seed'
import { skillsetsSeed } from '@/config/seeds/skillsets-seed'
import type TagsRepository from '@/modules/tags/tags.repository'

class TagsService {
    constructor(private readonly tagsRepository: TagsRepository) {}

    getMods() {
        return this.tagsRepository.getMods()
    }

    getSkillsets() {
        return this.tagsRepository.getSkillsets()
    }

    async initMods() {
        const modNames = Object.values(modsSeed).map(({ name, code }) => ({
            name,
            code,
        }))
        await this.tagsRepository.replaceMods(modNames)
    }

    async initSkillsets() {
        const skillsetsNames = Object.values(skillsetsSeed).map(
            ({ name, code, surveyDescription }) => ({
                name,
                code,
                surveyDescription,
            }),
        )

        await this.tagsRepository.replaceSkillsets(skillsetsNames)
    }
}

export default TagsService
