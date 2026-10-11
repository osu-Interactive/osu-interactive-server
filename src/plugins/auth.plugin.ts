import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { env } from '@/config/env'

export default fp((app) => {
    app.register(jwt, {
        secret: env.APP_KEY,
        cookie: {
            cookieName: 'auth',
            signed: false,
        },
    })
})
