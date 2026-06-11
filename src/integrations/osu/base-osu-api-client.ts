import Bottleneck from 'bottleneck'

const osuApiLimiter = new Bottleneck({
    reservoir: 60,
    reservoirRefreshAmount: 60,
    reservoirRefreshInterval: 60_000, // 1 min

    maxConcurrent: 5,

    highWater: 60,
    strategy: Bottleneck.strategy.OVERFLOW,
})

if (process.env.LOG_OSU_API_REQUESTS === 'true') {
    const COLORS = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
    } as const

    const STATUSES = {
        queued: 'Queued',
        executing: 'Executing',
        done: 'Done',
    } as const

    function logStatus(
        status: (typeof STATUSES)[keyof typeof STATUSES],
        statusColor: (typeof COLORS)[keyof typeof COLORS],
        id: unknown,
    ) {
        const displayId = String(id).startsWith('<no-id>') ? 'null' : id

        const statusText = `${status}:`

        console.log(
            `${statusColor}${statusText.padEnd(15)}${COLORS.reset}` +
            `${COLORS.red}${displayId}${COLORS.reset}`,
        )
    }

    osuApiLimiter.on('queued', (info) =>
        logStatus(STATUSES.queued, COLORS.yellow, info.options.id),
    )

    osuApiLimiter.on('executing', (info) =>
        logStatus(STATUSES.executing, COLORS.green, info.options.id),
    )

    osuApiLimiter.on('done', (info) =>
        logStatus(STATUSES.done, COLORS.blue, info.options.id),
    )
}



abstract class BaseApiClient {
    protected readonly clientId: string
    protected readonly clientSecret: string
    protected readonly baseUrl: string
    protected readonly limiter: Bottleneck

    protected constructor() {
        if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
            throw new Error('CLIENT_ID or CLIENT_SECRET is not defined')
        }

        this.clientId = process.env.CLIENT_ID
        this.clientSecret = process.env.CLIENT_SECRET
        this.baseUrl = 'https://osu.ppy.sh'
        this.limiter = osuApiLimiter
    }
}

export default BaseApiClient
