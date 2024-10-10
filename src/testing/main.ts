import { log } from 'console'
import { cpus } from 'os'
import { Storages, StreamContext, StreamWorker } from '../types'

/** SourceStream */

const ExampleStorage = {
    connect: () => Promise.resolve(true),
    query: (query: string) => [],
    write: (normalized: object | [object]) => true,
    normalizer: () => [{}]
}

type StreamDumpContext = {
    storages: Storages
    params: {
        maxworkers: number
        chuncksize: number
    }
}

const MAX_WORKERS = cpus().length

async function StreamDump(context: StreamDumpContext): Promise<[boolean, Error | void]> {
    
    // 1.1 Defining the context
    const streamContext: StreamContext = {
        workers: [... Array<StreamWorker>(context.params.maxworkers)]
            .map((_, index) => ({ idx: index, processing: false })),
        getWorker: () => streamContext.workers.find(w => !w.processing)
    }


    return [true, undefined]

    /**
     * 1. It should validate the connection on the two storages
     */

    log('[STREAM-DUMP] - Connecting on AccessStorage')
    const accessConnection = await context.storages.access.connect()
    if (!accessConnection) {
        return [false, new Error('AccessStorage was not able to connect')]
    }

    log('[STREAM-DUMP] - Connecting on StoreStorage')
    const storeConnection = await context.storages.store.connect()
    if (!storeConnection) {
        return [false, new Error('StoreConnection was not able to connect')]
    }

    /** 
     * 3. Create a while-true streaming chunks of the query into the workers until the return of a query is empty
     * 3.1 Before querying a new chunk verify if a worker is available by polling the list 
     * 3.2 Query a new chunk with the `chunksize` and pass it through
     */

    // Throws any error
    return [false, new Error('any')]
}

async function main() {
    const context: StreamDumpContext = {
        storages: {
            access: ExampleStorage,
            store: ExampleStorage
        },
        stream: {
            maxworkers: MAX_WORKERS,
            chuncksize: 10
        }
    }

    log('[STREAM-DUMP] - Starting the process')
    const [_, err] = await StreamDump(context)

    if (err) {
        log('STREAM-DUMP-ERROR - An error occurred while trying to realize the process')
        log('STREAM-DUMP-ERROR - ', err.message)
        return
    }

    log('STREAM-DUMP - Success migrating the data')
}

main()