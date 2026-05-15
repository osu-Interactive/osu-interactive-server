import { ERROR_SCENARIOS, DEFAULT_ERROR } from './error-scenarios'
import type { AppError } from './app-error'
import type {
    ResolvedError,
    ErrorScenario,
    ErrorScenarioResult,
} from '@/types/errors.types'

const handleError = (error: AppError) => {
    const errorCode = error?.code

    const scenario = errorCode ? ERROR_SCENARIOS[errorCode] : undefined

    if (!scenario) {
        return DEFAULT_ERROR
    }

    const errorData = resolveScenario(scenario, error)

    return getErrorData(errorCode, errorData)
}

const resolveScenario = (
    scenario: ErrorScenario,
    error: AppError,
): ErrorScenarioResult =>
    typeof scenario === 'function' ? scenario(error) : scenario

const getErrorData = (
    errorCode: string,
    errorData: ErrorScenarioResult,
): ResolvedError => {
    // Copy the object to prevent mutation of the original
    const result: ResolvedError = {
        ...errorData,
        code: errorData.code ?? errorCode,
        details: errorData.details ?? null,
        isOperational: errorData.isOperational ?? false,
    }

    if (
        errorData.message.length < 1 ||
        !isValidStatusCode(errorData.statusCode)
    ) {
        throw new Error(`Invalid error data: ${JSON.stringify(errorData)}`)
    }

    return result
}

const isValidStatusCode = (statusCode: number): statusCode is number =>
    Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599

export default handleError
