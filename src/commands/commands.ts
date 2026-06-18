import { sql } from 'drizzle-orm'
import mapsetsCollector from '@/utils/scripts/mapsets-collector'
import beatmapsCalculator from '@/utils/scripts/beatmap-calculator'
import { getCalculatedBeatmap } from '@/services/calculated-beatmaps.service'

import type { FastifyInstance } from 'fastify'
import { fakeSkillsets } from '@/utils/scripts/beatmap-skillsets-faker'

const commands = (app: FastifyInstance) => ({
    /**
     * Simply prints the names of all available commands in the console.
     */
    help() {
        console.log(Object.keys(commands(app)).filter((cmd) => cmd !== 'help'))
    },

    /**
     * Executes a raw SQL query and prints the result to the console.
     *
     * Intended for debugging and administrative tasks.
     * Use with caution: the query is executed as-is without
     * parameterization or additional validation.
     *
     * @param operation The SQL query to execute.
     */
    async 'execute-sql'(operation: string) {
        const result = await app.db.execute(sql.raw(operation))
        result.rows ? console.log(result.rows) : console.log(result)
    },

    /**
     * Fetches a specified number of beatmapsets from the osu! API,
     * stores them in the database, and logs the result.
     * It saves nonexistent beatmaps as null in db.
     *
     * @param amount Number of beatmapsets to fetch.
     * @param startId ID to start fetching from. The collector increments
     * the ID sequentially and attempts to retrieve every beatmapset.
     */
    async 'fetch-mapsets'(amount: number, startId: number) {
        await mapsetsCollector.startFetching(
            app.models.beatmap,
            amount,
            startId,
        )
    },

    /**
     * Calculates a beatmap using rosu-pp, applies filtering,
     * saves the result, and prints it to the console.
     *
     * Currently, a mock mapset ID is passed to the calculation function.
     * This behavior is temporary and the entire beatmap calculation
     * system is planned to be removed in the future.
     *
     * @param id Beatmap ID to calculate.
     */
    async 'calc-bm'(id: number) {
        console.log(
            await getCalculatedBeatmap(app.models.calculatedBeatmap, id, 10000),
        )
    },

    /**
     * Calculates beatmaps stored in the `mapsetsBeatmaps` table by
     * iterating through beatmap IDs sequentially, starting from `startId`.
     *
     * Similar to `fetch-mapsets`, but operates entirely on local database data.
     * An optional `extraCondition` parameter can be used to filter beatmaps
     * using SQL conditions.
     *
     * Example:
     * `ar >= 8 and max_combo > 400`
     *
     * Multiple conditions can be combined using `and`.
     *
     * Currently uses the same calculation logic as `calc-bm`, but
     * retrieves the correct mapset ID from the database instead of using
     * a mock value.
     *
     * This behavior is temporary and will change once the beatmap
     * calculation system is removed from the project.
     *
     * @param amount Number of beatmaps to process.
     * @param startId Beatmap ID to start processing from.
     * @param extraCondition Optional SQL condition used to filter beatmaps.
     */
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

    async 'fake-bms-skillsets'(amount: number, startId: number, extraCondition: string | null = null) {
        await fakeSkillsets(app.models.beatmap, amount, startId, extraCondition)
    }
})

export default commands
