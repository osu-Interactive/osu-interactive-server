import fp from 'fastify-plugin'
import handleError from '@/errors/error-handler'
import type { FastifyInstance, FastifyReply } from 'fastify'

async function errorHandlerPlugin(app: FastifyInstance) {
    app.setErrorHandler((error: unknown, _, reply: FastifyReply) => {
        handleError(error, reply)
    })
}

export default fp(errorHandlerPlugin)
