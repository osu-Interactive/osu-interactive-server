import Fastify from 'fastify'
import 'dotenv/config'
import routes from './routes/routes'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'

import osuApiPlugin from './plugins/osu-api.plugin'
import dbPlugin from './plugins/db.plugin'
import modelsPlugin from './plugins/models.plugin'
import servicesPlugin from './plugins/services.plugin'
import initTagsPlugin from '@/plugins/init-db-tables.plugin'
import authPlugin from './plugins/auth.plugin'
import errorPlugin from './plugins/error.plugin'
import successResponsePlugin from '@/plugins/success-response.plugin'

import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'

import { initCommands } from '@/commands/command-handler'

export async function buildApp() {
    const app = Fastify({
        logger: false,
    })

    await app.register(cors, {
        origin: true,
        credentials: true,
    })

    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)

    await app.register(cookie)

    await app.register(errorPlugin)
    await app.register(authPlugin)
    await app.register(dbPlugin)
    await app.register(osuApiPlugin)
    await app.register(modelsPlugin)
    await app.register(servicesPlugin)
    await app.register(initTagsPlugin)
    await app.register(successResponsePlugin)

    await app.register(routes)

    initCommands(app)

    console.log('Application is ready')

    return app
}
