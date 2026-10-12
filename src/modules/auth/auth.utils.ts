import type { FastifyReply } from 'fastify'
import { env } from '@/config/env'

const isProduction = env.NODE_ENV === 'production'

const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
}

export type AuthCookieName = 'auth' | 'refresh'

export function setAuthCookie(
    reply: FastifyReply,
    name: AuthCookieName,
    token: string,
    seconds: number,
): void {
    reply.setCookie(name, token, {
        ...authCookieOptions,
        maxAge: seconds,
    })
}

export function clearAuthCookie(reply: FastifyReply, cookieName: AuthCookieName): void {
    reply.clearCookie(cookieName, authCookieOptions)
}

export function clearAuthCookies(reply: FastifyReply): void {
    clearAuthCookie(reply, 'auth')
    clearAuthCookie(reply, 'refresh')
}
