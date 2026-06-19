import fp from 'fastify-plugin'
import TagsService from '@/services/tags.service'
import QuestsService from '@/services/quests.service'

export default fp(async (app) => {
    const tagsService = TagsService(app.models.tags)
    const questsService = QuestsService(app.models.quests)

    await questsService.initQuestsCategories()
    await tagsService.initMods()
    await tagsService.initSkillsets()
    console.log('DB Tables are initialized')
})
