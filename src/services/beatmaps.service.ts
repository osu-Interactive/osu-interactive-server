import client from '@/infrastructure/osu-api/osu-api-app-client'
import { mapMapset } from './private/osu/beatmaps-mapper.service'
import { AppError } from '@/errors/app-error'
import { errorTransformers } from '@/errors/error-transformer'

import type { Mapset as RawMapset } from '@/types/api-responses/mapset.types'
import type { BeatmapsModel } from '@/models/beatmaps.model'
import type { Mapset } from '@/types/osu.types'

const log = false

type FetchMapsetConfig = {
    raw?: boolean
    saveInDB?: boolean
}

export type BeatmapsService = ReturnType<typeof createBeatmapsService>

const createBeatmapsService = (mapsetModel: BeatmapsModel) => ({
    async getMapset(
        mapsetId: number,
        config: FetchMapsetConfig = {},
    ): Promise<Mapset | RawMapset | null> {
        //TODO: Decide what to do with broken mapsets like max_combo = null
        const { raw = false, saveInDB = true } = config

        try {
            const res = await client.get('/beatmapsets/' + mapsetId)
            const mapset: RawMapset = res.data

            const result = mapMapset(mapset)

            if (saveInDB) await mapsetModel.setMapset(result)

            if (log) console.log(result)

            return raw ? mapset : result
        } catch (err: unknown) {
            if (this.hasField(err, 'status') && err.status === 404) {
                mapsetModel.setNonexistentMapset(mapsetId)
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
    },

    hasField<K extends PropertyKey>(value: unknown, fieldName: K): value is Record<K, unknown> {
        return typeof value === 'object' && value !== null && fieldName in value
    },
})

export default createBeatmapsService
