import { AppError } from '@/errors/app-error'
import Bottleneck from 'bottleneck'

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
            //TODO: Extract and format validation errors
            const errorMessage = err instanceof Error ? err.message : String(err)

            error = new AppError('Client validation error', {
                code: 'INVALID_CLIENT_DATA',
                details: { validations: errorMessage },
                cause: err,
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
