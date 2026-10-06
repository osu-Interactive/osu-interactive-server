import client from '@/infrastructure/osu-api/osu-api-app-client'
import rosuBeatmapWrapper from '@/services/private/osu/rosu-beatmap-wrapper'
import { AppError } from '@/errors/app-error'
import { errorTransformers } from '@/errors/error-transformer'
import BeatmapsMapperService from '@/services/private/osu/beatmaps-mapper.service'
import ComboDifficultyCalculator from '@/services/private/quests/combo-difficulty-calculator'

import type { Mapset as RawMapset } from '@/types/api-responses/mapset.types'
import type { BeatmapsModel } from '@/models/beatmaps.model'
import type { Mapset } from '@/types/osu.types'

const log = false

type FetchMapsetConfig = {
    raw?: boolean
    saveInDB?: boolean
}

class BeatmapsService {
    private comboDifficultyCalculator = new ComboDifficultyCalculator()

    constructor(private readonly mapsetModel: BeatmapsModel) {}

    async getMapset(
        mapsetId: number,
        config: FetchMapsetConfig = {},
    ): Promise<Mapset | RawMapset | null> {
        //TODO: Decide what to do with broken mapsets like max_combo = null
        const { raw = false, saveInDB = true } = config

        try {
            const res = await client.get('/beatmapsets/' + mapsetId)
            const mapset: RawMapset = res.data

            const result = BeatmapsMapperService.mapMapset(mapset)

            if (saveInDB) await this.mapsetModel.setMapset(result)

            if (log) console.log(result)

            return raw ? mapset : result
        } catch (err: unknown) {
            if (this.hasField(err, 'status') && err.status === 404) {
                this.mapsetModel.setNonexistentMapset(mapsetId)
                return null
            }

            throw errorTransformers.bottleneckOverflow(
                err,
                new AppError(`Failed to fetch mapset ${mapsetId}`, {
                    code: 'FETCH_MAPSET_FAILED',
                    details: {
                        statusCode: `${this.hasField(err, 'status') ? err.status : ''}`,
                    },
                    cause: err,
                }),
            )
        }
    }

    async getCalculatedBeatmap(id: number, mapsetId: number) {
        const beatmap = await rosuBeatmapWrapper.create(id)
        const calculatedBeatmap = beatmap.calculate({ mods: 'CL' })
        const mappedCalculatedBeatmap = rosuBeatmapWrapper.map(calculatedBeatmap)
        await this.mapsetModel.setCalculatedBeatmap(mappedCalculatedBeatmap, id, mapsetId)

        return mappedCalculatedBeatmap
    }

    getBMComboDifficulty = async (beatmapId: number, targetPP: number) => {
        return { combo: await this.comboDifficultyCalculator.getBMComboPP(beatmapId, targetPP) }
    }

    hasField<K extends PropertyKey>(value: unknown, fieldName: K): value is Record<K, unknown> {
        return typeof value === 'object' && value !== null && fieldName in value
    }
}

export default BeatmapsService
