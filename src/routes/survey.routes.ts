import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { SurveyService } from '@/services/survey.service'
import TagsService from '@/services/tags.service'

export default async function surveyRoutes(app: FastifyInstance) {
    const surveyService = new SurveyService(app.db)
    const tagsService = TagsService(app.models.tags)

    app.get('/', async () => {
        return {
            skillsets: await tagsService.getSkillsets(),
            mods: await tagsService.getMods(),
        }
    })

    app.post(
        '/save',
        { preHandler: authMiddleware },
        async (request, _) => {
            const surveyData = request.body as {
                skillsetsIds: number[]
                modsIds: number[]
            }

            const userId = request.user.userId

            await surveyService.save(userId, surveyData)
        },
    )
}
