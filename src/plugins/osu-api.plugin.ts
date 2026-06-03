import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import OsuApiAppClient from '../integrations/osu/osu-api-app-client'

declare module 'fastify' {
    interface FastifyInstance {
        osuApi: typeof OsuApiAppClient
    }
}

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('osuApi', OsuApiAppClient)
})
