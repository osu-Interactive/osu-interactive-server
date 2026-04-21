import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async (app) => {
    app.register(jwt, {
        secret: process.env.APP_KEY || 'supersecret',
        cookie: {
            cookieName: 'auth',
            signed: false,
        },
    })
})
