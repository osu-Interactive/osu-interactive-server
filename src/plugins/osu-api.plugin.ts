import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import OsuApiAppClient from '@/infrastructure/osu-api/osu-api-app-client'

declare module 'fastify' {
    interface FastifyInstance {
        osuApi: typeof OsuApiAppClient
    }
}

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('osuApi', OsuApiAppClient)
})
