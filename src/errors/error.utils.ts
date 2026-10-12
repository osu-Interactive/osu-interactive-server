import { AppError } from '@/errors/app-error'

export function parseFastifyZodErrors(errors: string): Record<string, string | string[]> {
    const result: Record<string, string[]> = {}

    errors.split(/,\s*(?=body\/)/).forEach((error) => {
        const match = error.trim().match(/^(.*?)\s+(.*)$/)
        if (!match) return

        const field = match[1].replace(/^body\//, '')
        const message = match[2]

        ;(result[field] ??= []).push(message)
    })

    return Object.fromEntries(
        Object.entries(result).map(([field, messages]) => [
            field,
            messages.length === 1 ? messages[0] : messages,
        ]),
    )
}

export const findErrorInCauseChain = <T extends Error = AppError>(
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
