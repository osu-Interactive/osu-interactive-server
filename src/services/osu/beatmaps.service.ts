import Client from '@/integrations/osu/osu-api-app-client'
import { mapMapset } from './beatmaps-mapper.service'
import type { Mapset as RawMapset } from '@/types/api-responses/raw-mapset.types'
import { MapsetModel } from '@/models/mapset.model'
import type { Mapset } from '@/types/osu.types'

const client = new Client()

const log = false

export async function setMapset(
    mapsetModel: MapsetModel,
    mapsetId: number,
    raw = false,
): Promise<Mapset | RawMapset> {
    const res = await client.get('/beatmapsets/' + mapsetId)
    const mapset: RawMapset = res.data

    const result = mapMapset(mapset)
    await mapsetModel.setMapset(result)

    if (log) console.log(result)

    return raw ? mapset : result
}
