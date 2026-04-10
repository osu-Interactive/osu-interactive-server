import Fastify from 'fastify'
import 'dotenv/config'
import routes from './routes'
import cors from '@fastify/cors'

export async function buildApp() {
    const app = Fastify({
        logger: true,
    })

    await app.register(cors, {
        origin: true
    })

    await app.register(routes)

    return app
}
