export function average(a: number, b: number) {
    return (a + b) / 2
}

export function round(number: number) {
    return Math.round(number * 100) / 100
}

export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}
