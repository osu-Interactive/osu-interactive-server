import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyReply } from 'fastify'

import { AppError, findErrorInCauseChain } from '@/errors/app-error'
import { DEFAULT_ERROR } from '@/errors/error-scenarios'
import processError from '../errors/error-resolver'
import type { ResolvedError } from '@/types/errors.types'

async function errorHandlerPlugin(app: FastifyInstance) {
    app.setErrorHandler(async (error: Error, _, reply: FastifyReply) => {
        try {
            console.error('An error occurred:', error)

            const appError = findErrorInCauseChain(error, AppError)
            const errorData = appError ? processError(appError) : null

            if (errorData?.isOperational) {
                return sendError(reply, errorData)
            }

            console.error('The error is unrecoverable.')
            return sendDefaultError(reply)
        } catch (handlerError) {
            console.error('Error handling error:', handlerError)
            return sendDefaultError(reply)
        }
    })
}

function sendDefaultError(reply: FastifyReply) {
    return reply.status(DEFAULT_ERROR.statusCode).send({
        error: DEFAULT_ERROR.message,
        code: DEFAULT_ERROR.code,
        details: DEFAULT_ERROR.details,
    })
}

function sendError(reply: FastifyReply, errorData: ResolvedError) {
    return reply.status(errorData.statusCode).send({
        error: errorData.message,
        code: errorData.code,
        details: errorData.details,
    })
}

export default fp(errorHandlerPlugin)
