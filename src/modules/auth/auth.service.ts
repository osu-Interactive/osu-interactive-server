import { LoginWithOsu } from '@/modules/auth/private/login-with-osu.service'
import AuthTokensService from '@/modules/auth/private/auth-tokens.service'
import { env } from '@/config/env'

import type { UserRepository, UserModelFactory } from '@/modules/user/user.repository'
import type { DB } from '@/types/drizzle-pg-db.types'
import type { JWT } from '@fastify/jwt'

class AuthService extends AuthTokensService {
    constructor(
        userModel: UserRepository,
        jwt: JWT,
    ) {
        super(userModel, jwt)
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

    async loginWithOsu(db: DB, userModelFactory: UserModelFactory, osuApiCode: string) {
        const loginWithOsu = new LoginWithOsu(db, userModelFactory)
        return await loginWithOsu.auth(osuApiCode)
    }
}

export default AuthService
