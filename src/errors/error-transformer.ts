import Bottleneck from 'bottleneck'
import { AppError } from './app-error'
import { parseFastifyZodErrors } from './error.utils'

export function transformError(err: unknown, fallbackError: Error | null = null): Error {
    for (const wrapper of Object.values(errorTransformers)) {
        const wrapped = wrapper(err)

        if (wrapped) {
            return wrapped
        }
    }

    if (fallbackError) {
        return fallbackError
    }

    return toError(err)
}

//TODO: Transform zod error

const errorTransformers = {
    bottleneckOverflow: (err: unknown) => {
        let error: AppError | null = null

        if (err instanceof Bottleneck.BottleneckError) {
            error = new AppError('osu! API Overloaded', {
                code: 'OSU_API_OVERLOADED',
                cause: err,
            })
        }

        return error
    },

    fastifyValidation: (err: unknown) => {
        let error: AppError | null = null

        if (err && typeof err === 'object' && 'code' in err && err.code === 'FST_ERR_VALIDATION') {
            const errorMessage = err instanceof Error ? err.message : String(err)
            const parsedErrors = parseFastifyZodErrors(errorMessage)

            error = AppError.validationError(parsedErrors)
        }

        return error
    },

    axiosError: (err: unknown) => {
        let error: AppError | null = null

        if (err && typeof err === 'object' && 'isAxiosError' in err && err.isAxiosError) {
            const axiosError = err as {
                message?: string
                code?: string
                config?: {
                    method?: string
                    url?: string
                }
                response?: {
                    status?: number
                    data?: unknown
                }
            }

            error = new AppError('Axios Error', {
                code: 'AXIOS_ERROR',
                details: {
                    message: axiosError.message,
                    code: axiosError.code,
                    method: axiosError.config?.method?.toUpperCase(),
                    url: axiosError.config?.url,
                    status: axiosError.response?.status,
                    response: axiosError.response?.data,
                },
                cause: err,
                logCause: false,
            })
        }

        return error
    },
}

export function isError(error: unknown, check: keyof typeof errorTransformers) {
    return Boolean(errorTransformers[check](error))
}

function toError(err: unknown): Error {
    return err instanceof Error ? err : new Error(String(err))
}

export { errorTransformers }
