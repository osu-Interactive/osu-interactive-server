import fp from 'fastify-plugin'
import { buildServices, type Services } from '@/services/services'

declare module 'fastify' {
    interface FastifyInstance {
        services: Services
    }
}

export default fp(async (fastify) => {
    if (!fastify.db) {
        throw new Error('DB is not initialized')
    }
    const services = buildServices(fastify.models)

    fastify.decorate('services', services)
})
