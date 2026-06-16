import fp from 'fastify-plugin'
import TagsService from '@/services/tags.service'

export default fp(async (app) => {
    const tagsService = TagsService(app.models.tags)

    await tagsService.setMods()
    await tagsService.setSkillsets()
})
