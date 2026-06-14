import axios from 'axios'
import rosu, { PerformanceAttributes } from 'rosu-pp-js'
import { mapCalculatedBeatmap } from '@/services/osu/beatmaps-mapper.service'
import { osuApiLimiter } from '@/infrastructure/osu-api/request-limiter-config'
import { AppError } from '@/errors/app-error'
import type { CalculatedBeatmapsModel } from '@/models/calculated-beatmaps.model'
import type { MappedPerformanceAttributes } from '@/types/osu.types'

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

async function getBeatmapStructure(id: number): Promise<string> {
    const response = await osuApiLimiter.schedule(
        {
            id: `[BM_STRUCTURE_FETCH: GET /osu/${id}]`,
        },
        () => axios.get(`https://osu.ppy.sh/osu/${id}`, {
            responseType: 'text',
        }))

    const beatmapStructure: unknown = response.data

    if (typeof beatmapStructure !== 'string' || beatmapStructure.length < 50) {
        throw new AppError('Invalid beatmap structure', {
            code: 'INVALID_BEATMAP_STRUCTURE',
        })
    }

    return beatmapStructure
}
