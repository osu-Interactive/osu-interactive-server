import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'
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
            survey_result: user.survey_result,
        }
    })

    app.post<{
        Body: {
            skillsets: number[]
            mods: number[]
        }
    }>('/survey/save', { preHandler: authMiddleware }, async (req, _) => {
        const { skillsets, mods } = req.body ?? {}

        const errors: Record<string, string> = {}

        if (!Array.isArray(skillsets)) {
            errors.skillsets = 'skillsets must be an array'
        }

        if (!Array.isArray(mods)) {
            errors.mods = 'mods must be an array'
        }

        if (Object.keys(errors).length > 0) {
            throw AppError.validationError(errors)
        }

        const surveyResult = {
            skillsets,
            mods,
        }

        await app.models.user.saveSurveyResult(req.user.userId, surveyResult)
    })

    app.get('/survey', { preHandler: authMiddleware }, async (req) => {
        const user = await app.models.user.getById(req.user.userId, true)

        return {
            surveyResult: user.survey_result ?? {
                skillsets: [],
                mods: [],
            },
        }
    })
}
