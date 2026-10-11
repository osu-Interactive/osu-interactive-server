import fp from 'fastify-plugin'
import { buildModules } from '@/modules'

declare module 'fastify' {
    interface FastifyInstance {
        modules: ReturnType<typeof buildModules>
    }
}

export default fp(async (fastify) => {
    if (!fastify.db) {
        throw new Error('DB is not initialized')
    }
    const modules = buildModules(fastify.db)

    fastify.decorate('modules', modules)
})
