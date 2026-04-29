import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middlewares/auth.middleware'

export default async function userRoutes(app: FastifyInstance) {
    app.post<{
        Body: {
            skillsets: number[]
            mods: number[]
        }
    }>('/survey/save', { preHandler: authMiddleware }, async (req, reply) => {
        const { skillsets, mods } = req.body

        if (!Array.isArray(skillsets) || !Array.isArray(mods)) {
            return reply.status(400).send({
                error: 'Invalid survey payload',
            })
        }

        const surveyResult = {
            skillsets,
            mods,
        }

        await app.models.user.saveSurveyResult(req.user.userId, surveyResult)

        return {
            status: 'ok',
        }
    })
    app.get('/survey', { preHandler: authMiddleware }, async (req, reply) => {
        const user = await app.models.user.getById(req.user.userId)

        if (!user) {
            console.log("12313123")
            return reply.status(404).send({
                error: 'User not found',
            })
        }

        return {
            surveyResult: user.survey_result ?? {
                skillsets: [],
                mods: [],
            },
        }
    })
}
