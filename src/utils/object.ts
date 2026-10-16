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

export function hasField<K extends PropertyKey>(
    value: unknown,
    fieldName: K,
): value is Record<K, unknown> {
    return typeof value === 'object' && value !== null && fieldName in value
}

export function removeFields<T extends object, K extends PropertyKey>(
    obj: T,
    fields: readonly K[],
): Omit<T, K> {
    let result: object = obj

    for (const field of fields) {
        result = removeField(result, field)
    }

    return result as Omit<T, K>
}

export function removeField<T extends object, K extends PropertyKey>(obj: T, field: K): Omit<T, K> {
    const result = Object.create(
        Object.getPrototypeOf(obj),
        Object.getOwnPropertyDescriptors(obj),
    ) as T

    if (hasField(result, field)) {
        delete result[field]
    }

    return result as Omit<T, K>
}
