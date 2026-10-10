import crypto from 'crypto'
import { z } from 'zod'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '@/errors/app-error'
import { clearAuthCookies, setAuthCookie } from '@/utils/auth-cookies'
import { ZodTypeProvider } from '@fastify/type-provider-zod'

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

const loginSchema = z.object({
    osuApiCode: z.string().min(10).max(150),
    osuApiState: z.string().max(200).optional(),
})

type LoginBody = z.infer<typeof loginSchema>

export default async function authRoutes(app: FastifyInstance) {
    const authService = new app.services.factories.auth(app.models.user, app.jwt)

    app.get('/osuApiAuthLink', async (_, reply) => {
        const state: string = crypto.randomBytes(16).toString('hex')

        reply.setCookie('oauth_state', state, {
            ...cookieOptions,
            maxAge: 10 * 60, // 10 min
        })

        return { authLink: authService.getOsuApiAuthLink(state) }
    })

    app.withTypeProvider<ZodTypeProvider>().post(
        '/login',
        {
            schema: { body: loginSchema },
        },
        async (req, reply) => {
            if (!checkOAuthState(req, reply)) {
                console.log('Invalid CSRF Credentials from client')
                return
            }

            const { osuApiCode } = req.body
            const loginResult = await authService.loginWithOsu(
                app.db,
                app.models.factories.user,
                osuApiCode,
            )

            const { accessToken, refreshToken } = await authService.getJwtAndRefreshToken(
                loginResult.id,
                loginResult.osuId,
            )

            setAuthCookie(reply, 'auth', accessToken, authService.accessTokenTtlSeconds)
            setAuthCookie(reply, 'refresh', refreshToken, authService.refreshTokenTtlSeconds)

            return {
                user: loginResult,
                authTokenExpiresIn: authService.accessTokenTtlSeconds,
                refreshTokenExpiresIn: authService.refreshTokenTtlSeconds,
            }
        },
    )

    app.post('/logout', async (_, reply) => {
        clearAuthCookies(reply)

        return { success: true }
    })

    app.post('/refresh', async (req, reply) => {
        const refreshToken = req.cookies.refresh

        if (!refreshToken) {
            throw new AppError('Refresh token is missing', {
                code: 'MISSING_REFRESH_TOKEN',
            })
        }

        try {
            const { accessToken, refreshToken: newRefreshToken } =
                await authService.refreshTokens(refreshToken)

            setAuthCookie(reply, 'auth', accessToken, authService.accessTokenTtlSeconds)
            setAuthCookie(reply, 'refresh', newRefreshToken, authService.refreshTokenTtlSeconds)

            return {
                authTokenExpiresIn: authService.accessTokenTtlSeconds,
                refreshTokenExpiresIn: authService.refreshTokenTtlSeconds,
            }
        } catch (error) {
            clearAuthCookies(reply)
            throw error
        }
    })
}

function checkOAuthState(req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply): boolean {
    const { osuApiState } = req.body
    const cookieState = req.cookies.oauth_state

    if (!osuApiState || !cookieState || osuApiState !== cookieState) {
        reply.code(403).send({ error: 'Invalid CSRF state' })
        return false
    }

    reply.clearCookie('oauth_state', cookieOptions)
    return true
}
