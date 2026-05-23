import Client from '@/integrations/osu/osu-api-app-client'
import { mapMapset, Mapset } from './beatmaps-mapper.service'
import type { Mapset as RawMapset } from '@/types/api-responses/raw-mapset.types'
const client = new Client()

const log = false

export async function getMapset(
    mapsetId: number,
    raw = false,
): Promise<Mapset | RawMapset> {
    const res = await client.get('/beatmapsets/' + mapsetId)
    let mapset: RawMapset = res.data

    const result = raw ? mapset : mapMapset(mapset)

    if (log) console.log(result)

    return result
}
