import { FastifyInstance } from 'fastify'
import authRoutes from './auth'

export default async function routes(app: FastifyInstance) {
    app.get('/', async () => {
        const users = await app.db.query.users.findMany()
        console.log(users)
        return { hello: 'world' }
    })

    app.register(authRoutes, { prefix: '/auth' })
}
