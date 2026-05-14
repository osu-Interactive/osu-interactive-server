import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import DBClient from '../db/db.client'

import type { DB } from '@/types/drizzle-pg-db.types';

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
