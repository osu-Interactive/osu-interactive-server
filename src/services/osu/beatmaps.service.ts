import Client from '@/integrations/osu/osu-api-app-client'
import { mapMapset, mapCalculatedBeatmap } from './beatmaps-mapper.service'
import type { Mapset as RawMapset } from '@/types/api-responses/raw-mapset.types'
import { BeatmapsModel } from '@/models/beatmaps.model'
import type { Mapset, MappedPerformanceAttributes } from '@/types/osu.types'
import rosu, { type PerformanceAttributes } from 'rosu-pp-js'
import axios from 'axios'
import { AppError } from '@/errors/app-error'

const client = new Client()

const log = false

export async function setMapset(
    mapsetModel: BeatmapsModel,
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

export async function getCalculatedBeatmap(id: number) {
    const structure = await getBeatmapStructure(id)
    const res = await getCalculatedBeatmapPerformance(id, structure)
    const mappedRes: MappedPerformanceAttributes = mapCalculatedBeatmap(res)
    console.log(mappedRes)

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
