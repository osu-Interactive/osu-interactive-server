import { FastifyInstance } from 'fastify'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { skillsets, mods} from '../db/schemas/schema'
import { saveSurveyResult } from '../services/survey.service'
import dbClient from '../db/db.client'
import { AppError } from '@/errors/app-error'

const db = dbClient.getInstance().db

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

    app.get('/survey', async () => {
        const skillsetsList = await db.select().from(skillsets)
        const modsList = await db.select().from(mods)

        return {
            skillsets: skillsetsList,
            mods: modsList,
            selectedSkillsets: [],
            selectedMods: [],
        }
    })

    app.post('/survey/save', async (request, reply) => {
        await request.jwtVerify()

        console.log('REQUEST USER:', request.user)

        const body = request.body as {
            skillsets: number[]
            mods: number[]
        }

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

        const userId = request.user.userId

        await saveSurveyResult(userId, body)
    })
}
