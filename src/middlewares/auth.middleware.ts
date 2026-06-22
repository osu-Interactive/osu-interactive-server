import { FastifyReply, FastifyRequest } from 'fastify'

const DEV_AUTH_BYPASS_HEADER = 'x-dev-auth-bypass'
const DEV_AUTH_USER_ID_HEADER = 'x-dev-user-id'
const DEV_AUTH_OSU_ID_HEADER = 'x-dev-osu-id'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    if (canBypassAuthInDevelopment(request)) {
        request.user = {
            id: getDevAuthHeaderNumber(request, DEV_AUTH_USER_ID_HEADER, 1),
            osuId: getDevAuthHeaderNumber(request, DEV_AUTH_OSU_ID_HEADER, 0),
        }

        return
    }

    try {
        await request.jwtVerify()
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' })
    }
}

function canBypassAuthInDevelopment(request: FastifyRequest): boolean {
    if (process.env.NODE_ENV !== 'development') {
        return false
    }

    return request.headers[DEV_AUTH_BYPASS_HEADER] === 'true'
}

function getDevAuthHeaderNumber(request: FastifyRequest, header: string, fallback: number): number {
    const value = request.headers[header]

    if (typeof value !== 'string') {
        return fallback
    }

    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : fallback
}
