import { Pool } from 'pg'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from './schemas/schema'
import { env } from '@/config/env'

class DBClient {
    private static instance: DBClient
    private readonly pool: Pool
    public db: NodePgDatabase<typeof schema>

    private constructor() {
        this.pool = new Pool({
            host: env.DB_HOST,
            port: Number(env.DB_PORT),
            database: env.DB_NAME,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
        })

        this.pool.on('error', (err) => {
            console.error('Unexpected DB error', err)
        })

        this.db = drizzle(this.pool, { schema })
    }

    static getInstance(): DBClient {
        if (!DBClient.instance) {
            DBClient.instance = new DBClient()
        }
        return DBClient.instance
    }

    async close(): Promise<void> {
        await this.pool.end()
    }
}

export default DBClient
