import { FastifyInstance } from 'fastify'
import QuestCompletionService from '@/services/quest-completion.service'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { z } from 'zod'
import QuestsApplication from '@/application/quests.application'

import { ZodTypeProvider } from 'fastify-type-provider-zod'

const getUserQuestsBodySchema = z.object({
    categoryCode: z.number().int(),
})

export default async function questsRoutes(app: FastifyInstance) {
    const questCompletionService = new QuestCompletionService()

    app.withTypeProvider<ZodTypeProvider>().post(
        '/',
        {
            preHandler: authMiddleware,

            schema: {
                body: getUserQuestsBodySchema,
            },
        },
        async (req) => {
            const { categoryCode } = req.body

            const questsApplication = new QuestsApplication(app)

            return questsApplication.getUserQuests(req.user.id, categoryCode)
        },
    )

    app.get('/categories', { preHandler: authMiddleware }, async () => {
        return app.models.quests.getQuestsCategories()
    })

    app.get('/:id/evaluate', async (_, reply) => {
        await questCompletionService.evaluateQuestsCompletion()
    })
}
