import { ERROR_SCENARIOS, DEFAULT_ERROR } from './error-scenarios'
import type { AppError } from './app-error'
import type {
    ResolvedError,
    ErrorScenario,
    ErrorScenarioResult,
} from '@/types/errors.types'

const handleError = (error: AppError) => {
    const errorCode = typeof error?.code === 'string' ? error.code : undefined

    if (!errorCode) {
        throw new Error(`Error code must be a string: ${error?.code}`)
    }

    const scenario = errorCode ? ERROR_SCENARIOS[errorCode] : undefined

    if (!scenario) {
        return DEFAULT_ERROR
    }

    const errorData = resolveScenario(scenario, error)

    return getErrorData(errorCode, errorData, error)
}

const resolveScenario = (
    scenario: ErrorScenario,
    error: AppError,
): ErrorScenarioResult =>
    typeof scenario === 'function' ? scenario(error) : scenario

/*
 * Preprocesses concise error scenarios into a complete client-facing error.
 *
 * In error-scenarios.ts you may omit:
 * - message: falls back to the original AppError message
 * - code: falls back to the AppError code used to select the scenario
 * - details: falls back to null
 * - isOperational: falls back to false
 */
const getErrorData = (
    errorCode: string,
    errorData: ErrorScenarioResult,
    error: AppError,
): ResolvedError => {
    const message = errorData.message ?? error.message

    // Copy the object to prevent mutation of the original
    const result: ResolvedError = {
        ...errorData,
        message,
        code: errorData.code ?? errorCode,
        details: errorData.details ?? null,
        isOperational: errorData.isOperational ?? false,
    }

    if (message.length < 1 || !isValidStatusCode(errorData.statusCode)) {
        throw new Error(`Invalid error data: ${JSON.stringify(errorData)}`)
    }

    return result
}

const isValidStatusCode = (statusCode: number): statusCode is number =>
    Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599

export default handleError
