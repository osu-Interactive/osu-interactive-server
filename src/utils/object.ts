// Keeps only fields from the allowlist and returns a shallow copy.
type ValueMapper = (value: unknown) => unknown

export function pickFields<T extends object, const K extends readonly (keyof T)[]>(
    obj: T,
    fields: K,
    mapValue?: ValueMapper,
): Pick<T, K[number]> {
    const result = {} as Pick<T, K[number]>

    for (const field of fields) {
        if (field in obj) {
            result[field] = (mapValue ? mapValue(obj[field]) : obj[field]) as Pick<
                T,
                K[number]
            >[typeof field]
        }
    }

    return result
}

export function renameKeys<T extends Record<string, any>, R extends Record<string, string>>(
    obj: T,
    mapping: R,
) {
    const result: Record<string, any> = {}

    for (const key in obj) {
        result[mapping[key] ?? key] = obj[key]
    }

    return result
}
