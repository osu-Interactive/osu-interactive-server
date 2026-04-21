import fp from "fastify-plugin"
import type { Models } from '../types/models.types'
import { buildModels } from '../models/models'

declare module "fastify" {
    interface FastifyInstance {
        models: Models
    }
}

export default fp(async (fastify) => {
    if (!fastify.db) {
        throw new Error("DB is not initialized")
    }
    const models = buildModels(fastify.db)

    fastify.decorate("models", models)
})
