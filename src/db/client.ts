import { Pool } from 'pg'
import { drizzle, NodePgDatabase} from 'drizzle-orm/node-postgres'
import * as schema from '../db/schema'


class DBClient {
    private static instance: DBClient
    private readonly pool: Pool
    public db: NodePgDatabase<typeof schema>

    private constructor() {
        const {
            DB_HOST,
            DB_PORT,
            DB_NAME,
            DB_USER,
            DB_PASSWORD,
        } = process.env

        if (!DB_HOST || !DB_PASSWORD || !DB_NAME || !DB_USER || !DB_PORT) {
            throw new Error('Missing required database environment variables')
        }

        this.pool = new Pool({
            host: DB_HOST,
            port: Number(DB_PORT),
            database: DB_NAME,
            user: DB_USER,
            password: DB_PASSWORD,
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
