import { FastifyInstance } from 'fastify'
import authRoutes from './auth'

export default async function routes(app: FastifyInstance) {
    app.get('/', async () => {
        return { hello: 'world' }
    })

    app.register(authRoutes, { prefix: '/auth' })
}
