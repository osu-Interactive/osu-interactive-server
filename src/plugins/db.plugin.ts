import fp from 'fastify-plugin'
import DBClient from '@/db/db.client'
import type { FastifyInstance } from 'fastify'

import type { DB } from '@/shared/types/db.types'

declare module 'fastify' {
    interface FastifyInstance {
        db: DB
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const dbClient = DBClient.getInstance()

    fastify.decorate('db', dbClient.db)

    fastify.addHook('onClose', async () => {
        await dbClient.close?.()
    })
})
