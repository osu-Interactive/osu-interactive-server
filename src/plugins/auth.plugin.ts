import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async (app) => {
    const appKey = process.env.APP_KEY

    if (!appKey || appKey.length < 10) {
        throw new Error('APP_KEY is missing or invalid. It must be at least 10 characters long.');
    }

    app.register(jwt, {
        secret: appKey,
        cookie: {
            cookieName: 'auth',
            signed: false,
        },
    })
})
