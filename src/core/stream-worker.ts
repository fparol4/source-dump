
import { logger } from '../lib/pino'
import { WorkerContext, WorkerMessage, WorkerStatus } from '../types'
import { LockManager } from './lock-manager'

export class StreamWorker {
    // @TODO: [ ] maybe a OffsetHistory in here?
    private lockManager: LockManager = new LockManager()

    constructor(public idx: number){}

    get processing() {
        return this.lockManager.locked
    }

    public async select(): Promise<StreamWorker> {
        await this.lockManager.lock()
        return this  
    }

    // @TODO: context is required - optional only now
    public async notify(status: WorkerStatus, context?: WorkerMessage) {
        logger.debug({ status, context }, 'Will notify')
    }

    public async run(context: WorkerContext): Promise<void> {
        /**
         * ! - Its not necessary to compensate anything 
         * ! - In every case we notify with `notify(`error`)` on error
         * [ ] 1. Add context into every notification
         * (opt) [] Add custom error with messages if is necessary
         */
        try {
            const queryResult = await context.storages.readStorage.query(context.pagination)
            if (!queryResult.length) return this.notify(WorkerStatus.END) 
            const normalized = context.storages.writeStorage.normalize(queryResult)
            const isSuccessfull = context.storages.writeStorage.write(normalized) 
            if (!isSuccessfull) return this.notify(WorkerStatus.FAILED)
            return this.notify(WorkerStatus.COMPLETED)
        } catch (error) {
            this.notify(WorkerStatus.ERROR)
        } finally { // @TODO: Precisa ser solto na notificação de volta
            this.lockManager.release() 
        }
    }
}
