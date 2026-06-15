import { FastifyInstance } from 'fastify'
import { evaluateQuestsCompletion } from '@/services/quest-completion.service'

export default async function questsRoutes(app: FastifyInstance) {
    app.get('/:id/evaluate', async (_, reply) => {
        await evaluateQuestsCompletion()
    })
}
