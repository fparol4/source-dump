import { StreamWorker } from './stream-worker'

export class StreamWorkerManager { 
    private POLLING_INTERVAL: number = 100 //ms 
    private workers: Array<StreamWorker> = []

    constructor(maxWorkers: number) {
        this.workers = Array.from(
            { length: maxWorkers },
            (_, idx) => new StreamWorker(idx)
        )
    }

    private getAvailableWorker() {
        return this.workers.find(w => !w.processing)
    }

    public async getWorker(): Promise<StreamWorker> {
        let pollingInterval: ReturnType<typeof setInterval>; 
        const availableWorker = await new Promise<StreamWorker>(resolve => {
            pollingInterval = setInterval(async () => {
                const worker = this.getAvailableWorker()
                if (worker) {
                    await worker.select()
                    return resolve(worker)
                }
            }, this.POLLING_INTERVAL)
        })
        //@ts-ignore - Claiming that the variable will not have any value
        clearInterval(pollingInterval)
        return availableWorker
    }
}   