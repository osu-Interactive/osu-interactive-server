type Seconds = number

class RequestsProcessor {
    constructor(
        private readonly requestLimit: number,
        private readonly requestLimitResetIn: Seconds,
    ) {}

    private requestsCount = 0
    private lastReset = Date.now()

    async wrap<T>(request: () => Promise<T>): Promise<T> {
        if (this.requestsCount >= this.requestLimit) {
            if (this.timeToReset()) {
                this.resetRequestCount()
            } else {
                const waitMs = this.requestLimitResetIn * 1000 - (Date.now() - this.lastReset)

                await new Promise(resolve => setTimeout(resolve, waitMs))
                if (this.timeToReset()) {
                    this.resetRequestCount()
                }
            }
        }

        this.requestsCount++

        return request()
    }

    private timeToReset() {
        return Date.now() - this.lastReset >= (this.requestLimitResetIn * 1000)
    }

    private resetRequestCount() {
        this.requestsCount = 0
        this.lastReset = Date.now()
    }
}

export default RequestsProcessor
