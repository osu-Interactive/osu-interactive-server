import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { SurveyService } from '@/services/survey.service'

export default async function userRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: authMiddleware }, async (req) => {
        const user = await app.models.user.requireById(req.user.userId)

        return {
            name: user.name,
            osu_id: user.osu_id,
            avatar_url: user.avatar_url,
            pp: user.pp,
            country: user.country,
        }
    })

    app.get('/survey', async () => {
        const skillsetsList = await app.models.survey.getAllSkillsets()
        const modsList = await app.models.survey.getAllMods()

        return {
            skillsets: skillsetsList,
            mods: modsList,
        }
    })

    app.post(
        '/survey/save',
        { preHandler: authMiddleware },
        async (request, _) => {
            const surveyService = new SurveyService(app.db)
            const surveyData = request.body as {
                skillsets: number[]
                mods: number[]
            }

            const userId = request.user.userId

            await surveyService.save(userId, surveyData)
        },
    )
}
