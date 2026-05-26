import type { FastifyInstance } from 'fastify'
import mapsetsCollector from '@/utils/mapsets-collector'

const commands = (app: FastifyInstance) => ({
    async 'fetch-bss'(amount: number, startId: number) {
        await mapsetsCollector.startFetching(app.models.mapset, amount, startId)
    }
})

export default commands
