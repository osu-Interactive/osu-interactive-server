import Fastify from 'fastify'
import 'dotenv/config'
import routes from './routes'
import cors from '@fastify/cors'

import osuApiPlugin from './plugins/osu-api'

import { sql } from 'drizzle-orm'
import DBClient from './db/client'
const dbClient = DBClient.getInstance()
const db = dbClient.db

export async function buildApp() {
    const app = Fastify({
        logger: false,
    })

    const dbPing = await db.execute(sql`SELECT 1`)
    console.log(dbPing)

    await app.register(cors, {
        origin: true,
    })

    await app.register(osuApiPlugin)
    await app.register(routes)

    return app
}
