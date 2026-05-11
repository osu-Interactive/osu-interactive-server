type AppErrorDetails = Record<string, string | string[]> | null

interface AppErrorOptions {
    code?: string
    details?: AppErrorDetails
    cause?: unknown
}

class AppError extends Error {
    public code: string
    public details: AppErrorDetails

    constructor(
        message: string,
        { code, details = null, cause = null }: AppErrorOptions = {},
    ) {
        super(message, { cause })

        this.name = this.constructor.name

        this.code = resolveFromCause(code, cause, 'code', 'UNKNOWN_ERROR')
        this.details = resolveFromCause(details, cause, 'details', null)

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
    static validationError(
        fields: Record<string, string | string[]>,
    ): AppError {
        const message = 'Validation failed'
        const code = 'VALIDATION_ERROR'

        return new AppError(message, {
            code,
            details: fields,
        })
    }
}

class AppErrorMatcher {
    private readonly error: unknown
    private result: AppError | null = null

    constructor(error: unknown) {
        this.error = error
    }

    case(
        parentCode: string,
        message: string,
        options: Omit<AppErrorOptions, 'cause'> = {},
    ): this {
        if (
            !this.result &&
            this.error instanceof AppError &&
            this.error.code === parentCode
        ) {
            this.result = new AppError(message, {
                ...options,
                cause: this.error,
            })
        }

        return this
    }

    or(
        fallbackMessage: string,
        fallbackOptions: Omit<AppErrorOptions, 'cause'> = {},
    ): AppError {
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

const findErrorInCauseChain = <T extends Error = AppError>(
    err: unknown,
    TargetError: new (...args: any[]) => T = AppError as any,
): T | null => {
    let current: unknown = err

    while (current instanceof Error) {
        if (current instanceof TargetError) {
            return current
        }

        current = current.cause instanceof Error ? current.cause : null
    }

    return null
}

const resolveFromCause = <T, K extends keyof AppError>(
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

export { AppError, AppErrorMatcher, findErrorInCauseChain }
