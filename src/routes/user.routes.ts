import { FastifyInstance } from 'fastify'
import { saveSurveyResult } from '../services/survey.service'
import dbClient from '../db/db.client'
import { skillsets } from '../db/schemas/skillsets.schema'
import { mods } from '../db/schemas/mods.schema'

const db = dbClient.getInstance().db

export default async function userRoutes(app: FastifyInstance) {
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

        const userId = request.user.userId

        await saveSurveyResult(userId, body)

        return {
            status: 'ok',
        }
    })
}
