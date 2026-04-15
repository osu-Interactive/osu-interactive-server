import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import DBClient from '../db/client'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../db/schema/index'

type DB = NodePgDatabase<typeof schema>

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
