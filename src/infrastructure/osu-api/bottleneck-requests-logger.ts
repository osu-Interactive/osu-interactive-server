import Bottleneck from 'bottleneck'

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
} as const

function logStatus(
    status: string,
    color: string,
    id: unknown,
) {
    const displayId = String(id).startsWith('<no-id>') ? 'null' : id

    console.log(
        `OSU_API: ` +
        `${color}${`${status}:`.padEnd(15)}${COLORS.reset}` +
        `${COLORS.red}${displayId}${COLORS.reset}`,
    )
}

export function attachLimiterLogger(limiter: Bottleneck) {
    limiter.on('queued', (info) =>
        logStatus('Queued', COLORS.yellow, info.options.id),
    )

    limiter.on('executing', (info) =>
        logStatus('Executing', COLORS.blue, info.options.id),
    )

    limiter.on('done', (info) =>
        logStatus('Done', COLORS.green, info.options.id),
    )
}
