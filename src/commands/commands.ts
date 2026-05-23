import mapsetsCollector from '@/utils/mapsets-collector'

const commands = {
    'fetch-bss': async (amount: number, startId: number) => {
        await mapsetsCollector.startFetching(amount, startId)
    }
}

export default commands
