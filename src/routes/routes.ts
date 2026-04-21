import { FastifyInstance } from 'fastify'
import authRoutes from './auth.routes'

export default async function routes(app: FastifyInstance) {
    app.get('/', async () => {
        console.log(await app.models.user.getById(10))
        return { hello: 'world' }
    })

    app.register(authRoutes, { prefix: '/auth' })
}
