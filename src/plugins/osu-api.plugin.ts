import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import OsuApiAppClient from '../integrations/osu-api-app-client'

declare module 'fastify' {
    interface FastifyInstance {
        osuApi: OsuApiAppClient
    }
}

export default fp(async (fastify: FastifyInstance) => {
    const client = new OsuApiAppClient()

    fastify.decorate('osuApi', client)
})
