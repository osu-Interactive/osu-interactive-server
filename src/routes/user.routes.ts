import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { SurveyService } from '@/services/survey.service'
import { AppError } from '@/errors/app-error'

export default async function userRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: authMiddleware }, async (req) => {
        const user = await app.models.user.getById(req.user.userId, true)

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
            const body = request.body as {
                skillsets: number[]
                mods: number[]
            }

            const errors: Record<string, string> = {}

            if (!Array.isArray(body.skillsets)) {
                errors.skillsets = 'skillsets must be an array'
            }

            if (!Array.isArray(body.mods)) {
                errors.mods = 'mods must be an array'
            }

            if (Object.keys(errors).length > 0) {
                throw AppError.validationError(errors)
            }

            const userId = request.user.userId

            await surveyService.save(userId, body)
        },
    )
}
