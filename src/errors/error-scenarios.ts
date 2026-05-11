import type { AppError } from './app-error'

export type ErrorData = {
    message: string
    statusCode: number
    code?: string
    details?: unknown
    isOperational?: boolean
}

export type ResolvedError = {
    message: string
    statusCode: number
    code: string
    details: unknown
    isOperational: boolean
}

export type DefaultServerErrorScenario = {
    defaultServerError: true
}

const DEFAULT_ERROR: ResolvedError = {
    message: 'Internal server error',
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    details: null,
    isOperational: false,
}

const defaultServerError: DefaultServerErrorScenario = {
    defaultServerError: true,
}

type ErrorScenarioResult = ErrorData | DefaultServerErrorScenario

type ErrorScenarioHandler = (error?: AppError) => ErrorScenarioResult

type ErrorScenario = ErrorScenarioResult | ErrorScenarioHandler

const defineErrorScenarios = <T extends Record<string, ErrorScenario>>(
    scenarios: T,
): T & Record<string, ErrorScenario | undefined> => scenarios

const ERROR_SCENARIOS = defineErrorScenarios({
    TEST_ERROR: defaultServerError,

    VALIDATION_ERROR: (error) => {
        return {
            message: 'Validation failed',
            statusCode: 400,
            details: error?.details,
            isOperational: true,
        }
    }
})

export { DEFAULT_ERROR, ERROR_SCENARIOS, defaultServerError }
export type { ErrorScenario, ErrorScenarioResult }
