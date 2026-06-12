import type { AppError } from '@/errors/app-error'

export type ErrorData = {
    message?: string
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

export type ErrorScenarioResult = ErrorData

export type ErrorScenarioHandler = (error?: AppError) => ErrorScenarioResult

export type ErrorScenario = ErrorScenarioResult | ErrorScenarioHandler
