import Fastify from 'fastify'
import 'dotenv/config'
import routes from './routes'
import cors from '@fastify/cors'

import osuApiPlugin from './plugins/osu-api'

export async function buildApp() {
    const app = Fastify({
        logger: false,
    })

    await app.register(cors, {
        origin: true,
    })

    await app.register(osuApiPlugin)
    await app.register(routes)

    return app
}
