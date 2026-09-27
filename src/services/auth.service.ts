import { LoginWithOsu } from '@/services/private/auth/login-with-osu.service'
import AuthTokensService from '@/services/private/auth/auth-tokens.service'
import type { UserModel, UserModelFactory } from '@/models/user.model'
import type { DB } from '@/types/drizzle-pg-db.types'
import type { JWT } from '@fastify/jwt'

class AuthService extends AuthTokensService {
    constructor(
        userModel: UserModel,
        jwt: JWT,
    ) {
        super(userModel, jwt)
    }

    getOsuApiAuthLink(state: string) {
        const osuApiClientId: string = String(process.env.CLIENT_ID)

        return (
            'https://osu.ppy.sh/oauth/authorize' +
            `?client_id=${osuApiClientId}` +
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
