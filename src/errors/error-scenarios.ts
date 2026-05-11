import type {
    ResolvedError,
    ErrorScenario,
} from '../types/errors.types'

const DEFAULT_ERROR: ResolvedError = {
    message: 'Internal server error',
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    details: null,
    isOperational: false,
}

const defineErrorScenarios = <T extends Record<string, ErrorScenario>>(
    scenarios: T,
): T & Record<string, ErrorScenario | undefined> => scenarios

const ERROR_SCENARIOS = defineErrorScenarios({
    TEST_ERROR: DEFAULT_ERROR,

    VALIDATION_ERROR: (error) => ({
        message: 'Validation failed',
        statusCode: 400,
        details: error?.details,
        isOperational: true,
    })
})

export { DEFAULT_ERROR, ERROR_SCENARIOS }
