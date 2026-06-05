import type { FastifyInstance } from 'fastify'
import { sql } from 'drizzle-orm'
import mapsetsCollector from '@/utils/scripts/mapsets-collector'
import { getCalculatedBeatmap } from '@/services/osu/beatmaps.service'

const commands = (app: FastifyInstance) => ({
    help() {
        console.log(
            Object.keys(commands(app)).filter(cmd => cmd !== 'help')
        )
    },

    async 'execute-sql'(operation: string) {
        const result = await app.db.execute(sql.raw(operation))
        result.rows ? console.log(result.rows) : console.log(result)
    },

    async 'fetch-bss'(amount: number, startId: number) {
        await mapsetsCollector.startFetching(
            app.models.beatmap,
            amount,
            startId,
        )
    },

    async 'get-calc-bm'(id: number) {
        await getCalculatedBeatmap(app.models.calculatedBeatmap, id)
    }
})

export default commands
