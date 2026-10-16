import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

import BeatmapSkillsetAnalyzerFaker from '@/utils/beatmap-skillset-analyzer-faker'

const skillsetAnalyzerFakeRoute: FastifyPluginAsync = async (app) => {
    app.post('/skillsets', async (request, reply) => {
        const { beatmapId } = request.body as { beatmapId: number }

        if (!Number.isInteger(beatmapId)) {
            return reply.code(400).send({ error: 'beatmapId must be an integer' })
        }

        return new BeatmapSkillsetAnalyzerFaker().getSkillsets(beatmapId)
    })
}

export default fp(skillsetAnalyzerFakeRoute)
