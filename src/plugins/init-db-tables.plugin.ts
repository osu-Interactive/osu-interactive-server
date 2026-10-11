import fp from 'fastify-plugin'
import TagsService from '@/modules/tags/tags.service'
import QuestsService from '@/modules/quests/quests.service'

export default fp(async (app) => {
    const tagsService = new TagsService(app.modules.tags.repository)
    const questsService = new QuestsService(app.modules.quests.repository)

    await questsService.initQuestsCategories()
    await tagsService.initMods()
    await tagsService.initSkillsets()
    console.log('DB Tables are initialized')
})
