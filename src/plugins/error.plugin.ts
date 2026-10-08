import fp from 'fastify-plugin'
import handleError from '../errors/error-resolver'
import logError from '@/utils/logging/error-logger'
import { DEFAULT_ERROR } from '@/errors/error-scenarios'
import { AppError, findErrorInCauseChain } from '@/errors/app-error'
import { clearAuthCookies } from '@/utils/auth-cookies'
import { transformError } from '@/errors/error-transformer'

import type { FastifyInstance, FastifyReply } from 'fastify'
import type { ResolvedError } from '@/types/errors.types'

async function errorHandlerPlugin(app: FastifyInstance) {
    app.setErrorHandler((error: unknown, _, reply: FastifyReply) => {
        try {
            const transformedError = transformError(error)
            console.error('\x1b[41m\x1b[37m An error occurred: \x1b[0m', transformedError)

            const appError = findErrorInCauseChain(transformedError, AppError)
            const errorData = appError ? handleError(appError) : null

            if (errorData?.isOperational) {
                if (shouldClearClientAuth(errorData)) {
                    clearAuthCookies(reply)
                }

                return sendErrorResponse(reply, errorData)
            }

            handleNonOperationalError(transformedError, reply)
        } catch (handlerError) {
            console.error('Error handling error:', handlerError)
            handleNonOperationalError(error, reply)
        }
    })
}

function handleNonOperationalError(error: unknown, reply: FastifyReply) {
    console.error(`The error is unrecoverable.`) //We don't have to log the error in the console because of previous code
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

function shouldClearClientAuth(error: ResolvedError): boolean {
    return error.code === 'USER_NOT_FOUND'
}

export default fp(errorHandlerPlugin)
