import client from '@/integrations/osu/osu-api-app-client'
import { mapMapset, mapCalculatedBeatmap } from './beatmaps-mapper.service'
import rosu, { type PerformanceAttributes } from 'rosu-pp-js'
import axios from 'axios'
import { AppError } from '@/errors/app-error'

import type { Mapset as RawMapset } from '@/types/api-responses/raw-mapset.types'
import type { BeatmapsModel } from '@/models/beatmaps.model'
import type { CalculatedBeatmapsModel } from '@/models/calculated-beatmaps.model'
import type { Mapset, MappedPerformanceAttributes } from '@/types/osu.types'

const log = false

type FetchMapsetConfig = {
    raw?: boolean
    saveInDB?: boolean
}

//TODO: Decide what to do with broken mapsets like max_combo = null
export async function getMapset(
    mapsetModel: BeatmapsModel,
    mapsetId: number,
    config: FetchMapsetConfig = {},
): Promise<Mapset | RawMapset | null> {
    const { raw = false, saveInDB = true } = config
    try {
        const res = await client.get('/beatmapsets/' + mapsetId)
        const mapset: RawMapset = res.data

        const result = mapMapset(mapset)

        if (saveInDB) await mapsetModel.setMapset(result)

        if (log) console.log(result)

        return raw ? mapset : result
    } catch (err: unknown) {
        if (hasField(err, 'status') && err.status === 404) {
            mapsetModel.setNonexistentMapset(mapsetId)
            return null
        }

        throw new AppError(`Failed to fetch mapset ${mapsetId}`, {
            code: 'FETCH_MAPSET_FAILED',
            details: {
                statusCode: `${hasField(err, 'status') ? err.status : ''}`,
            },
        })
    }
}

function hasField<K extends PropertyKey>(
    value: unknown,
    fieldName: K,
): value is Record<K, unknown> {
    return typeof value === 'object' && value !== null && fieldName in value
}

export async function getCalculatedBeatmap(
    calculatedBeatmapsModel: CalculatedBeatmapsModel,
    id: number,
    mapsetId: number,
) {
    const structure = await getBeatmapStructure(id)
    const res = await getCalculatedBeatmapPerformance(id, structure)
    const mappedRes: MappedPerformanceAttributes = mapCalculatedBeatmap(res)
    await calculatedBeatmapsModel.setBeatmap(mappedRes, id, mapsetId)

    return mappedRes
}

async function getBeatmapStructure(id: number): Promise<string> {
    const response = await axios.get(`https://osu.ppy.sh/osu/${id}`, {
        responseType: 'text',
    })

    const beatmapStructure: unknown = response.data

    if (typeof beatmapStructure !== 'string' || beatmapStructure.length < 50) {
        throw new AppError('Invalid beatmap structure', {
            code: 'INVALID_BEATMAP_STRUCTURE',
        })
    }

    return beatmapStructure
}

async function getCalculatedBeatmapPerformance(
    id: number,
    structure: string,
): Promise<PerformanceAttributes> {
    try {
        const map = new rosu.Beatmap(structure)
        return new rosu.Performance({ mods: 'CL' }).calculate(map)
    } catch (error) {
        throw new Error(`Failed to calculate data for beatmap ${id}`, {
            cause: error,
        })
    }
}
