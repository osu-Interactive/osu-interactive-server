import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getOsuApiAuthLink, login } from '../services/auth.service'
import crypto from 'crypto'

/**
 * In production, HTTPS is expected.
 * Cookies should use `secure: true`.
 * If you run production without HTTPS, explicitly set `secure` to false.
 */
const isProduction: boolean = process.env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/auth',
}

export default async function authRoutes(app: FastifyInstance) {
    app.get('/osuApiAuthLink', async (req, reply) => {
        const state: string = crypto.randomBytes(16).toString('hex')

        reply.setCookie('oauth_state', state, {
            ...cookieOptions,
            maxAge: 30,
        })

        return { authLink: getOsuApiAuthLink(state) }
    })

    app.post<{
        Body: { osuApiCode: string; osuApiState?: string }
    }>('/login', async (req, reply) => {
        if (!checkState(req, reply)) {
            console.log('Invalid CSRF Credentials from client')
            return
        }

        const { osuApiCode } = req.body
        return login(app.models.user, app.db, osuApiCode)
    })
}

function checkState(
    req: FastifyRequest<{ Body: { osuApiState?: string } }>,
    reply: FastifyReply,
): boolean {
    const { osuApiState } = req.body
    const cookieState = req.cookies.oauth_state

    if (!osuApiState || !cookieState || osuApiState !== cookieState) {
        reply.code(403).send({ error: 'Invalid CSRF state' })
        return false
    }

    reply.clearCookie('oauth_state', cookieOptions)
    return true
}
