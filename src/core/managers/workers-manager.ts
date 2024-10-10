import { v4 as uuidv4 } from 'uuid';
import { WorkerContext } from '../../types';

type W = any

export class Worker {
    public idx: number = uuidv4()
    // Add lockManager and return it into a fn
    public processing: boolean = false 
    // @TODO: [ ] maybe a OffsetHistory in here?

    constructor() {}

    public async run(context: WorkerContext): Promise<void> {
        /**
         * 1. Call the readStorage.query(pagination)
         *  on_error -> { }
         * 2. Call 
         */
    }
}

export class WorkersManager { 
    private workers: Array<W>
    private queue: Array<W>

    constructor() {}
}   