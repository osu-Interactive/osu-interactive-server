import { getCalculatedBeatmap } from '@/services/calculated-beatmaps.service'
import type { BeatmapsModel } from '@/models/beatmaps.model'
import type { CalculatedBeatmapsModel } from '@/models/calculated-beatmaps.model'
import type { BeatmapsSearchExtraCondition } from '@/types/osu.types'

type CalculatedBeatmaps = Awaited<
    ReturnType<BeatmapsModel['getBeatmapsBaseOnCalculation']>
>

class BeatmapCalculator {
    public async runCalculation(
        beatmapsModel: BeatmapsModel,
        calculatedBeatmapsModel: CalculatedBeatmapsModel,
        amount: number,
        startId: number,
        extraCondition: string | null = null,
    ) {
        const parsedExtraCondition = extraCondition
            ? this.parseExtraConditions(extraCondition)
            : null

        const uncalculatedBeatmaps =
            await beatmapsModel.getBeatmapsBaseOnCalculation(
                false,
                parsedExtraCondition,
            )

        if (uncalculatedBeatmaps.length === 0) {
            return console.error('No beatmaps found matching your parameters')
        }

        let beatmapsIds = this.prepareBeatmapIds(uncalculatedBeatmaps, startId)

        if (amount > beatmapsIds.length) {
            amount = beatmapsIds.length
            console.log(
                `The amount of required beatmaps is more than total beatmaps amount in db: ${amount}\n` +
                    `Continuing with all available beatmaps`,
            )
        }

        await this.calculateBeatmapsByIds(calculatedBeatmapsModel, beatmapsIds, amount)
        console.log(`Successfully calculated data for ${amount} beatmaps`)
    }

    private async calculateBeatmapsByIds(
        calculatedBeatmapsModel: CalculatedBeatmapsModel,
        beatmapsIds: number[][],
        amount: number,
    ) {
        let calculatedBeatmapsAmount = 0

        for (const beatmap of beatmapsIds) {
            if (calculatedBeatmapsAmount < amount) {
                await getCalculatedBeatmap(
                    calculatedBeatmapsModel,
                    beatmap[0],
                    beatmap[1],
                )
                calculatedBeatmapsAmount++
            }
        }
    }

    private sliceBeatmapsIdsByStartId(
        beatmapsIds: number[][],
        startId: number,
    ) {
        const index = beatmapsIds.findIndex((item) => item[0] === startId)
        return index !== -1 ? beatmapsIds.slice(index) : beatmapsIds
    }

    private parseExtraConditions = (
        extraConditionsRaw: string,
    ): BeatmapsSearchExtraCondition => {
        const conditions = extraConditionsRaw.split('and')

        const res: BeatmapsSearchExtraCondition = []

        conditions.forEach((condition) => {
            const tokens = condition.trim().split(' ')

            if (tokens.length === 3) {
                const value = this.parseIfNumber(tokens[2])

                res.push({
                    field: tokens[0],
                    condition: tokens[1],
                    value,
                })
            } else {
                throw new Error('Invalid extra conditions')
            }
        })

        return res
    }

    private parseIfNumber(rawValue: string) {
        return /^-?\d+(\.\d+)?$/.test(rawValue) ? Number(rawValue) : rawValue
    }

    private prepareBeatmapIds(beatmaps: CalculatedBeatmaps, startId: number) {
        const beatmapsIds = beatmaps
            .map((beatmap) => [
                beatmap.beatmap_id,
                beatmap.mapset_id,
            ])
            .sort((a, b) => a[0] - b[0])

        return this.sliceBeatmapsIdsByStartId(beatmapsIds, startId)
    }
}

export default new BeatmapCalculator()
