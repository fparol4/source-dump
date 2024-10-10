import { logger } from './lib/pino'
import { ProcessContext, SourceStreamContext } from './types';
import { connectStorages } from './core/connect-storages';
import { startStreamProcess } from './core/stream-process'

async function SourceStream(streamContext: SourceStreamContext) {
    logger.debug('Starting stream-process')
    /** Program - [ ]
     * 1. [x] Try to connect into the storages
     * 2. [ ] Write `offsetManager` & `workersManager`
     * 3. [ ] Call stream-process 
     * 4. [ ] Write the StreamWorker 
     * 5. [ ] Handle all possible notifications
     */
    
    await connectStorages(streamContext.storages)
    
    try { 
        const processContext: ProcessContext = {

        }

        startStreamProcess(processContext)

    } catch {
        // @TODO: Handle the error saving the context history 
    }
}

const mocked = {} as SourceStreamContext
SourceStream(mocked)