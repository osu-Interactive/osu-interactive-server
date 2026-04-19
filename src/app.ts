import Fastify from 'fastify'
import 'dotenv/config'
import routes from './routes'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import osuApiPlugin from './plugins/osu-api'
import dbPlugin from './plugins/db'
import models from './plugins/models'
import authPlugin from './plugins/auth'

export async function buildApp() {
    const app = Fastify({
        logger: false,
    })

    await app.register(cors, {
        origin: true,
        credentials: true,
    })

    await app.register(cookie)
    await app.register(authPlugin)
    await app.register(dbPlugin)
    await app.register(osuApiPlugin)
    await app.register(models)
    await app.register(routes)

    return app
}
