import fs from 'fs'
import path from 'path'
import { stringify } from 'safe-stable-stringify'

const logPath = path.join(__dirname, '../../../logs/error.log');
const maxLogSizeBytes = 50 * 1024 * 1024

export default function logError(error: unknown): void {
    try {
        const message = `[${getTime(true)}]\n` + formatError(error) + '\n\n'
        clearLogIfTooLarge()

        fs.appendFile(logPath, message, (e) => {
            if (e) {
                console.error('Failed log writing:', e)
            }
        })
    } catch (e) {
        console.error('Logger crashed:', e)
    }
}

function clearLogIfTooLarge(): void {
    if (!fs.existsSync(logPath)) return

    const { size } = fs.statSync(logPath)

    if (size > maxLogSizeBytes) {
        fs.truncateSync(logPath, 0)
        console.log('Error logs was cleared')
    }
}

export function getTime(withDate: boolean = false): string {
    const now = new Date()
    const time = now.toTimeString().split(' ')[0]

    if (!withDate) return time

    const date = now.toISOString().split('T')[0] // YYYY-MM-DD
    return `${date} ${time}`
}

function formatError(error: unknown, indent = 0): string {
    const pad = ' '.repeat(indent)

    if (!(error instanceof Error)) {
        return pad + stringify(error)
    }

    const { base, cause } = extractError(error)

    let result = ''

    if (typeof base.stack === 'string') {
        result += `${pad}${base.stack}\n`
    } else {
        result += `${pad}${error.name}: ${base.message}\n`
    }

    Object.entries(base).forEach(([key, value]) => {
        if (key === 'message' || key === 'stack') return

        result += `${pad}${key}: ${
            typeof value === 'object'
                ? stringify(value)
                : String(value)
        }\n`
    })

    if (cause) {
        result += `${pad}Caused by:\n`
        result += formatError(cause, indent + 2)
    }

    return result
}

interface ExtractedError {
    base: Record<string, unknown>
    cause?: unknown
}

function extractError(error: unknown): ExtractedError {
    if (!(error instanceof Error)) {
        return {
            base: {
                type: typeof error,
                value: error,
            },
        }
    }

    const base: Record<string, unknown> = {}
    let cause: unknown

    Object.getOwnPropertyNames(error).forEach((key) => {
        if (key === 'cause') {
            cause = (error as Error & { cause?: unknown }).cause
        } else {
            base[key] = (error as unknown as Record<string, unknown>)[key]
        }
    })

    return { base, cause }
}
