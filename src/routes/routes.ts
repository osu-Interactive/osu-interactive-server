import { FastifyInstance } from 'fastify'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'

export default async function routes(app: FastifyInstance) {
    app.get('/', async () => {
        console.log(await app.models.user.getById(10))
        return { hello: 'world' }
    })

    app.register(authRoutes, { prefix: '/auth' })
    app.register(userRoutes, { prefix: '/user' })
}
