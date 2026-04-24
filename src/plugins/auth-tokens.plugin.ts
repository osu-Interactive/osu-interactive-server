import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import { AuthTokensService } from '../services/auth-tokens.service'

declare module 'fastify' {
    interface FastifyInstance {
        authTokens: AuthTokensService
    }
}

async function authTokensPlugin(app: FastifyInstance) {
    const service = new AuthTokensService(app)

    app.decorate('authTokens', service)
}

export default fp(authTokensPlugin)
