import { LoginWithOsu } from '@/modules/auth/private/login-with-osu.service'
import AuthTokensService from '@/modules/auth/private/auth-tokens.service'
import { env } from '@/config/env'

import type UserRepository from '@/modules/user/user.repository'
import type { DB } from '@/types/drizzle-pg-db.types'
import type { JWT } from '@fastify/jwt'

class AuthService extends AuthTokensService {
    constructor(
        userRepository: UserRepository,
        jwt: JWT,
    ) {
        super(userRepository, jwt)
    }

    getOsuApiAuthLink(state: string) {
        return (
            'https://osu.ppy.sh/oauth/authorize' +
            `?client_id=${env.CLIENT_ID}` +
            '&redirect_uri=http://localhost:5173/login' +
            '&response_type=code' +
            '&scope=public+identify' +
            `&state=${state}`
        )
    }

    async loginWithOsu(db: DB, createUserRepository: typeof UserRepository, osuApiCode: string) {
        const loginWithOsu = new LoginWithOsu(db, createUserRepository)
        return await loginWithOsu.auth(osuApiCode)
    }
}

export default AuthService
