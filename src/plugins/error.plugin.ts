import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyReply } from 'fastify'

import { AppError, findErrorInCauseChain } from '@/errors/app-error'
import { DEFAULT_ERROR } from '@/errors/error-scenarios'
import processError from '../errors/error-resolver'
import logError from '@/utils/logging/error-logger'
import type { ResolvedError } from '@/types/errors.types'

async function errorHandlerPlugin(app: FastifyInstance) {
    app.setErrorHandler((error: unknown, _, reply: FastifyReply) => {
        try {
            console.error('An error occurred:', error)

            const appError = findErrorInCauseChain(error, AppError)
            const errorData = appError ? processError(appError) : null

            if (errorData?.isOperational) {
                return sendErrorResponse(reply, errorData)
            }

            handleNonOperationalError(error, reply)
        } catch (handlerError) {
            console.error('Error handling error:', handlerError)
            handleNonOperationalError(error, reply)
        }
    })
}

function handleNonOperationalError(error: unknown, reply: FastifyReply) {
    console.error(`The error is unrecoverable.`) //We don't have to log the error in console because of previous code
    logError(error)
    return sendErrorResponse(reply, DEFAULT_ERROR)
}

function sendErrorResponse(reply: FastifyReply, error: ResolvedError) {
    if (reply.sent) return

    return reply.status(error.statusCode).send({
        error: error.message,
        code: error.code,
        details: error.details,
    })
}

export default fp(errorHandlerPlugin)
