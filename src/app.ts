import Fastify from 'fastify'
import 'dotenv/config'
import routes from './routes/routes'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import osuApiPlugin from './plugins/osu-api.plugin'
import dbPlugin from './plugins/db.plugin'
import modelsPlugin from './plugins/models.plugin'
import authPlugin from './plugins/auth.plugin'
import authTokensPlugin from './plugins/auth-tokens.plugin'
import errorPlugin from './plugins/error.plugin'
import successResponsePlugin from '@/plugins/success-response.plugin'
import { initCommands } from '@/commands/command-handler'

export async function buildApp() {
    const app = Fastify({
        logger: false,
    })

    await app.register(cors, {
        origin: true,
        credentials: true,
    })

    await app.register(errorPlugin)
    await app.register(cookie)
    await app.register(authPlugin)
    await app.register(dbPlugin)
    await app.register(osuApiPlugin)
    await app.register(modelsPlugin)
    await app.register(authTokensPlugin)
    await app.register(successResponsePlugin)
    await app.register(routes)
    initCommands()


    return app
}
