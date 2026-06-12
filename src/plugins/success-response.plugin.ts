import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

async function responseStatusPlugin(app: FastifyInstance) {
    app.addHook('preSerialization', async (request, reply, payload) => {
        if (request.method !== 'POST') {
            return payload
        }

        if (reply.statusCode >= 400) {
            return payload
        }

        if (payload === undefined || payload === null) {
            return { status: 'ok' }
        }

        if (typeof payload !== 'object' || Array.isArray(payload)) {
            return payload
        }

        return {
            status: 'status' in payload ? payload.status : 'ok',
            ...payload,
        }
    })
}

export default fp(responseStatusPlugin)
