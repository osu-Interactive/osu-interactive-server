import type { FastifyInstance } from 'fastify'
import { sql } from 'drizzle-orm'
import mapsetsCollector from '@/utils/scripts/mapsets-collector'
import beatmapsCalculator from '@/utils/scripts/beatmap-calculator'
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
        await getCalculatedBeatmap(app.models.calculatedBeatmap, id, 10000)
    },

    async 'run-calc-bms'(
        amount: number,
        startId: number,
        extraCondition: string | null = null,
    ) {
        await beatmapsCalculator.runCalculation(
            app.models.beatmap,
            app.models.calculatedBeatmap,
            amount,
            startId,
            extraCondition,
        )
    },
})

export default commands
