import { AppError } from '@/errors/app-error'
import Bottleneck from 'bottleneck'

type ErrorTransformer = (err: unknown, fallbackError?: Error | null, isStream?: boolean) => Error | null

export function transformError(err: unknown, fallbackError: Error | null = null): Error {
    for (const wrapper of Object.values(errorTransformers)) {
        const wrapped = wrapper(err, fallbackError, true)

        if (wrapped) {
            return wrapped
        }
    }

    return toError(err)
}

function toError(err: unknown): Error {
    return err instanceof Error ? err : new Error(String(err))
}

function resolveMappedError(
    error: Error | null,
    originalError: unknown,
    isStream: boolean = false,
    fallbackError: Error | null = null
): Error | null {
    if (fallbackError) {
        return fallbackError
    } else {
        return isStream ? error : (error ?? toError(originalError))
    }
}

const errorTransformers: Record<string, ErrorTransformer> = {
    bottleneckOverflow: (err: unknown, fallbackError: Error | null = null, isStream: boolean = false) => {
        let error: AppError | null = null

        if (err instanceof Bottleneck.BottleneckError) {
            error = new AppError('osu! API Overloaded', {
                code: 'OSU_API_OVERLOADED',
                cause: err,
            })
        }

        return resolveMappedError(error, err, isStream, error ? null : fallbackError)
    },
}

export { errorTransformers }
