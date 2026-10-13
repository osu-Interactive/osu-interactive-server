import logError from '@/utils/logging/error-logger'
import { DEFAULT_ERROR } from '@/errors/error-scenarios'
import { AppError } from '@/errors/app-error'
import { findErrorInCauseChain } from '@/errors/error.utils'
import { clearAuthCookies } from '@/modules/auth/auth.utils'
import { transformError } from './error-transformer'
import resolveError from './error-resolver'

import type { FastifyReply } from 'fastify'
import type { ResolvedError } from '@/errors/error.types'

export default function handleError(error: unknown, reply: FastifyReply) {
    try {
        const transformedError = transformError(error)
        console.error('\x1b[41m\x1b[37m An error occurred: \x1b[0m', transformedError)

        const appError = findErrorInCauseChain(transformedError, AppError)
        const errorData = appError ? resolveError(appError) : null

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
}

export function handleErrorInternal(error: unknown) {
    try {
        const transformedError = transformError(error)
        console.error('\x1b[41m\x1b[37m An internal error occurred: \x1b[0m', transformedError)

        handleNonOperationalError(transformedError)
    } catch (handlerError) {
        console.error('Error handling error:', handlerError)
        handleNonOperationalError(error)
    }
}

function handleNonOperationalError(error: unknown, reply: FastifyReply | null = null) {
    console.error(`The error is unrecoverable.`) //We don't have to log the error in the console because of previous code
    logError(error)

    if (!reply) return
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
