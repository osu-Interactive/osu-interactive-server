import type { FastifyInstance } from 'fastify'
import mapsetsCollector from '@/utils/mapsets-collector'
import { getCalculatedBeatmap } from '@/services/osu/beatmaps.service'

const commands = (app: FastifyInstance) => ({
    async 'fetch-bss'(amount: number, startId: number) {
        await mapsetsCollector.startFetching(app.models.mapset, amount, startId)
    },

    async 'get-calc-bm'(id: number) {
        await getCalculatedBeatmap(id)
    }
})

export default commands
