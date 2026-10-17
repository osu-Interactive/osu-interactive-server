import { sql } from 'drizzle-orm'
import MapsetsCollector from '@/utils/scripts/mapsets-collector'
import BeatmapCalculator from '@/utils/scripts/beatmap-calculator'
import { skillsetsFetcher } from '@/utils/scripts/beatmap-skillsets-fetcher'
import helpCommand from './help-command'

import type { FastifyInstance } from 'fastify'

export type Commands = ReturnType<typeof commands>

const commands = (app: FastifyInstance) => {
    const mapsetsCollector = new MapsetsCollector(app.modules.beatmaps.repository)
    const beatmapsCalculator = new BeatmapCalculator(app.modules.beatmaps.repository)

    return {
        help: {
            body: () => {
                const commandsList = commands(app)
                helpCommand(commandsList)
            },
        },

        clear: {
            description: 'Clears the console output.',
            example: '/clear',

            body: () => {
                process.stdout.write('\x1Bc')
            },
        },

        'execute-sql': {
            description:
                'Executes raw SQL queries and prints results to the console. ' +
                'For debugging and administrative use only.' +
                ' Use with caution: unrestricted queries are allowed, including UPDATE and DELETE',
            arguments: [
                {
                    name: 'operation',
                    type: 'string',
                    required: true,
                    description: 'The SQL query to execute.',
                },
            ],
            example: '/execute-sql "SELECT * FROM beatmap_skillsets LIMIT 10"',

            body: async (operation: string) => {
                const result = await app.db.execute(sql.raw(operation))
                result.rows ? console.log(result.rows) : console.log(result)
            },
        },

        'fetch-mapsets': {
            description:
                'Fetches beatmapsets from the osu! API sequentially by ID and stores the results in the database.' +
                ' Beatmapsets that do not exist are stored as null.',
            arguments: [
                {
                    name: 'amount',
                    type: 'number',
                    required: true,
                    description: 'The number of consecutive beatmapset IDs to process.',
                },
                {
                    name: 'startId',
                    type: 'number',
                    required: true,
                    description: 'The ID of the first beatmapset to fetch.',
                },
            ],
            example: '/fetch-mapsets 50 50000',

            body: async (amount: number, startId: number) => {
                await mapsetsCollector.startFetching(
                    app.modules.beatmaps.repository,
                    amount,
                    startId,
                )
            },
        },

        'calc-bms': {
            description:
                'Calculates beatmap statistics for records stored in the mapsetsBeatmaps table. ' +
                'Supports filtering beatmaps using an optional SQL condition.',
            arguments: [
                {
                    name: 'amount',
                    type: 'number',
                    required: true,
                    description: 'The maximum number of beatmaps to process.',
                },
                {
                    name: 'startId',
                    type: 'number',
                    required: true,
                    description: 'The beatmap ID from which processing begins.',
                },
                {
                    name: 'extraCondition',
                    type: 'string | null',
                    required: false,
                    default: null,
                    description:
                        'An optional SQL condition used to filter beatmaps, without the WHERE keyword.',
                },
            ],
            example: '/calc-bms 10 10000 "combo <= 500 AND mode = osu"',

            body: async (amount: number, startId: number, extraCondition: string | null = null) => {
                await beatmapsCalculator.runCalculation(
                    app.modules.beatmaps.repository,
                    amount,
                    startId,
                    extraCondition,
                )
            },
        },

        'fetch-bms-skillsets': {
            description:
                'Fetches skillset data for beatmaps from an external skillset analyzer and saves the results' +
                ' to the database. ' +
                'Supports filtering beatmaps using an optional SQL condition.',
            arguments: [
                {
                    name: 'amount',
                    type: 'number',
                    required: true,
                    description: 'The maximum number of beatmaps to process.',
                },
                {
                    name: 'startId',
                    type: 'number',
                    required: true,
                    description: 'The beatmap ID from which processing begins.',
                },
                {
                    name: 'extraCondition',
                    type: 'string | null',
                    required: false,
                    default: null,
                    description:
                        'An optional SQL condition used to filter beatmaps, without the WHERE keyword.',
                },
            ],
            example: '/fetch-bms-skillsets 100 10000 "stars >= 5.5 AND mode = osu"',

            body: async (amount: number, startId: number, extraCondition: string | null = null) => {
                await skillsetsFetcher(
                    app.modules.beatmaps.service,
                    app.modules.beatmaps.repository,
                    amount,
                    startId,
                    extraCondition,
                )
            },
        },
    }
}

export default commands
