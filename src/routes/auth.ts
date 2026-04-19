import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getOsuApiAuthLink, login } from '../services/auth.service'
import crypto from 'crypto'
import type { DBUser } from '../types/osu'
import { authMiddleware } from '../middlewares/auth'

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
    app.get('/osuApiAuthLink', async (_, reply) => {
        const state: string = crypto.randomBytes(16).toString('hex')

        reply.setCookie('oauth_state', state, {
            ...cookieOptions,
            maxAge: 10 * 60, // 10 min
        })

        return { authLink: getOsuApiAuthLink(state) }
    })

    app.post<{
        Body: { osuApiCode: string; osuApiState?: string }
    }>('/login', async (req, reply) => {
        if (!checkOAuthState(req, reply)) {
            console.log('Invalid CSRF Credentials from client')
            return
        }

        const { osuApiCode } = req.body
        const loginResult = await login(app.models.user, app.db, osuApiCode)

        const tokenTtlSeconds = 60 * 60 * 24 * 14 // Auth token will be for two weeks valid
        const token = signJwtToken(app, loginResult, tokenTtlSeconds)
        setClientAuthCookie(reply, token, tokenTtlSeconds)
        return loginResult
    })

    app.get('/me', { preHandler: authMiddleware }, async (req, reply) => {
        const user = await app.models.user.getById(req.user.userId)

        if (!user) {
            setLogoutCookie(reply)
            return reply.status(401).send({ error: 'Unauthorized' })
        }

        return {
            name: user.name,
            osu_id: user.osu_id,
            avatar_url: user.avatar_url,
            pp: user.pp,
            country: user.country,
            survey_result: user.survey_result
        }
    })

    app.post('/logout', async (_, reply) => {
        setLogoutCookie(reply)

        return { success: true }
    })
}

function checkOAuthState(
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

function signJwtToken(
    app: FastifyInstance,
    user: DBUser,
    seconds: number,
): string {
    return app.jwt.sign(
        {
            userId: user.id,
            osuId: user.osu_id,
        },
        { expiresIn: seconds },
    )
}

function setClientAuthCookie(
    reply: FastifyReply,
    token: string,
    seconds: number,
): void {
    reply.setCookie('auth', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: seconds,
    })
}

function setLogoutCookie(reply: FastifyReply): void {
    reply.clearCookie('auth', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
    })
}
