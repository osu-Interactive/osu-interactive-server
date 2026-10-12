import { findErrorInCauseChain } from './error.utils'

type AppErrorDetails = Record<string, string | string[]> | null
type AppErrorDetailsValidation = { field: string; message: string }[] | null

type AppErrorOptions = {
    code?: string
    details?: AppErrorDetails | AppErrorDetailsValidation
    cause?: unknown
}

class AppError extends Error {
    public code: string
    public details: AppErrorDetails | AppErrorDetailsValidation

    constructor(message: string, { code, details = null, cause = null }: AppErrorOptions = {}) {
        super(message, { cause })

        this.name = this.constructor.name

        this.code = this.resolveFromCause(code, cause, 'code', 'UNKNOWN_ERROR')
        this.details = this.resolveFromCause(details, cause, 'details', null)

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor)
        }
    }

    static match(error: unknown): AppErrorMatcher {
        return new AppErrorMatcher(error)
    }

    /**
     * Default error for validation errors.
     */
    static validationError(fields: Record<string, string | string[]>): AppError {
        const message = 'Validation failed'
        const code = 'VALIDATION_ERROR'

        const details = Object.entries(fields).flatMap(([field, messages]) =>
            (Array.isArray(messages) ? messages : [messages]).map((message) => ({
                field,
                message,
            })),
        )

        return new AppError(message, {
            code,
            details,
        })
    }

    private resolveFromCause = <T, K extends keyof AppError>(
        value: T | undefined | null,
        cause: unknown,
        field: K,
        fallback: T,
    ): T => {
        if (value != null) {
            return value
        }

        if (cause instanceof Error) {
            const parent = findErrorInCauseChain(cause, AppError)

            return (parent?.[field] as T | undefined) ?? fallback
        }

        return fallback
    }
}

class AppErrorMatcher {
    private readonly error: unknown
    private result: AppError | null = null

    constructor(error: unknown) {
        this.error = error
    }

    case(parentCode: string, message: string, options: Omit<AppErrorOptions, 'cause'> = {}): this {
        if (!this.result && this.error instanceof AppError && this.error.code === parentCode) {
            this.result = new AppError(message, {
                ...options,
                cause: this.error,
            })
        }

        return this
    }

    or(fallbackMessage: string, fallbackOptions: Omit<AppErrorOptions, 'cause'> = {}): AppError {
        if (this.result) {
            return this.result
        }

        return new AppError(fallbackMessage, {
            ...fallbackOptions,
            cause: this.error,
        })
    }

    /**
     * If some case matched, returns the matched error.
     * If no case matched, returns the original error.
     */
    resolve(): unknown {
        return this.result ?? this.error
    }
}

export { AppError, AppErrorMatcher }
