import type { BeatmapSearchConditions } from '@/modules/beatmaps/beatmaps.types'

export function parseExtraConditions(extraConditionsRaw: string): BeatmapSearchConditions {
    const conditions = extraConditionsRaw.split('and')

    const res: BeatmapSearchConditions = []

    conditions.forEach((condition) => {
        const tokens = condition.trim().split(' ')

        if (tokens.length === 3) {
            const value = parseIfNumber(tokens[2])

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

function parseIfNumber(rawValue: string) {
    return /^-?\d+(\.\d+)?$/.test(rawValue) ? Number(rawValue) : rawValue
}
