import { FastifyInstance } from 'fastify'
import { getOsuApiAuthLink, login } from '../services/auth.service'

export default async function authRoutes(app: FastifyInstance) {
    app.get('/osuApiAuthLink', async () => {
        return { authLink: getOsuApiAuthLink() }
    })

    app.post('/login', async (req, res) => {
        const { osuApiCode } = req.body as { osuApiCode: string }
        return login(osuApiCode)
    })
}
