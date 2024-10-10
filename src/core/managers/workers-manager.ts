import { v4 as uuidv4 } from 'uuid';
import { LockManager } from './lock-manager'
import { WorkerContext, WorkerMessage, WorkerStatus } from '../../types';
import { logger } from '../../lib/pino';

export class Worker {
    // @TODO: [ ] maybe a OffsetHistory in here?
    public idx: number = uuidv4()
    private lockManager: LockManager = new LockManager()

    get processing() {
        return this.lockManager.locked
    }

    public async notify(status: WorkerStatus, context?: WorkerMessage) {
        logger.debug({ status, context }, 'Will notify')
    }

    public async run(context: WorkerContext): Promise<void> {
        /**
         * ! - Its not necessary to compensate anything 
         * ! - In every case we notify with `notify(`error`)` on error
         * 1. Call readStorage.query(pagination)
         * 2. Call writeStorage.normalize(chunk)
         * 3. Call writeStorage.write(chunk)
         * [ ] 1. Add context into every notification
         * (opt) [] Add custom error with messages if is necessary
         */
        await this.lockManager.lock()
        try {
            const queryResult = await context.storages.readStorage.query(context.pagination)
            if (!queryResult.length) return this.notify(WorkerStatus.END) 
            const normalized = context.storages.writeStorage.normalize(queryResult)
            const isSuccessfull = context.storages.writeStorage.write(normalized) 
            if (!isSuccessfull) return this.notify(WorkerStatus.FAILED)
            return this.notify(WorkerStatus.COMPLETED)
        } catch (error) {
            this.notify(WorkerStatus.ERROR)
        } finally {
            this.lockManager.release() 
        }
    }
}

export class WorkersManager { 
    private workers: Array<Worker>

    constructor() {}
}   