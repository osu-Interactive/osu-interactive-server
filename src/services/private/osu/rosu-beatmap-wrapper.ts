import { mapCalculatedBeatmap } from '@/services/private/osu/beatmaps-mapper.service'
import { osuApiLimiter } from '@/infrastructure/osu-api/request-limiter-config'
import axios from 'axios'
import { AppError } from '@/errors/app-error'
import rosu from 'rosu-pp-js'

type Beatmap = InstanceType<typeof rosu.Beatmap>
type PerformanceOptions = ConstructorParameters<typeof rosu.Performance>[0]

export type RosuBeatmap = Beatmap & {
    calculate: (
        args?: PerformanceOptions,
    ) => ReturnType<InstanceType<typeof rosu.Performance>['calculate']>
}

type CalculatedBeatmap = ReturnType<InstanceType<typeof rosu.Performance>['calculate']>

class RosuBeatmapWrapper {
    public static async create(beatmapId: number): Promise<RosuBeatmap> {
        const structure = await this.getBeatmapStructure(beatmapId)
        return this.createWithStructure(structure)
    }

    public static createWithStructure(structure: string): RosuBeatmap {
        const beatmap = new rosu.Beatmap(structure)

        return Object.assign(beatmap, {
            calculate: (args?: PerformanceOptions) => new rosu.Performance(args).calculate(beatmap),
        })
    }

    public static map(beatmap: CalculatedBeatmap) {
        return mapCalculatedBeatmap(beatmap)
    }

    public static async getBeatmapStructure(id: number): Promise<string> {
        const response = await osuApiLimiter.schedule(
            {
                id: `[BM_STRUCTURE_FETCH: GET /osu/${id}]`,
            },
            () =>
                axios.get(`https://osu.ppy.sh/osu/${id}`, {
                    responseType: 'text',
                }),
        )

        const beatmapStructure: unknown = response.data

        if (typeof beatmapStructure !== 'string' || beatmapStructure.length < 50) {
            throw new AppError('Invalid beatmap structure', {
                code: 'INVALID_BEATMAP_STRUCTURE',
            })
        }

        return beatmapStructure
    }
}

export default RosuBeatmapWrapper
