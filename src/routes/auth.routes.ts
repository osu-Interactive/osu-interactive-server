import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getOsuApiAuthLink, login } from '@/services/auth.service'
import crypto from 'crypto'
import { clearAuthCookies, setAuthCookie } from '@/utils/auth-cookies'

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

        console.log(getOsuApiAuthLink(state))
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

        const { accessToken, refreshToken } =
            await app.authTokens.getJwtAndRefreshToken(
                loginResult.id,
                loginResult.osu_id,
            )

        setAuthCookie(
            reply,
            'auth',
            accessToken,
            app.authTokens.accessTokenTtlSeconds,
        )
        setAuthCookie(
            reply,
            'refresh',
            refreshToken,
            app.authTokens.refreshTokenTtlSeconds,
        )

        return {
            user: loginResult,
            authTokenExpiresIn: app.authTokens.accessTokenTtlSeconds,
            refreshTokenExpiresIn: app.authTokens.refreshTokenTtlSeconds,
        }
    })

    app.post('/logout', async (_, reply) => {
        clearAuthCookies(reply)

        return { success: true }
    })

    app.post('/refresh', async (req, reply) => {
        const refreshToken = req.cookies.refresh

        if (!refreshToken) {
            return reply.status(401).send({ error: 'No refresh token' })
        }

        try {
            const { accessToken, refreshToken: newRefreshToken } =
                await app.authTokens.refreshTokens(refreshToken)

            setAuthCookie(
                reply,
                'auth',
                accessToken,
                app.authTokens.accessTokenTtlSeconds,
            )
            setAuthCookie(
                reply,
                'refresh',
                newRefreshToken,
                app.authTokens.refreshTokenTtlSeconds,
            )

            return {
                authTokenExpiresIn: app.authTokens.accessTokenTtlSeconds,
                refreshTokenExpiresIn: app.authTokens.refreshTokenTtlSeconds,
            }
        } catch {
            clearAuthCookies(reply)

            return reply.status(401).send({ error: 'Invalid refresh token' })
        }
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
