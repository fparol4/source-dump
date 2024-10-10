import { OffsetManager } from "./core/offset-manager"
import { StreamWorkerManager } from "./core/stream-worker-manager"

/** Storages */
export type Storage = {
    connect: () => Promise<boolean>
}

export type WriteStorage = Storage & {
    write<T>(normalized: [T]): Promise<boolean>
    normalize<T>(denormalized: [object]): [T]
}

export type ReadPagination = {
    limit: number
    offset: number
}

export type ReadStorage = Storage & {
    query(pagination: ReadPagination): Promise<[object]>
}

export type SourceStreamStorages = {
    readStorage: ReadStorage
    writeStorage: WriteStorage
}

/** SourceStream */
export type SourceStreamContextParams = {
    maxWorkers: number
    chunkSize: number
}

export type SourceStreamContext = {
    storages: SourceStreamStorages
    params: SourceStreamContextParams
}

/** WorkerContext */
export type WorkerContext = {
    storages: SourceStreamStorages
    pagination: ReadPagination
}

export type Worker = {
    idx: number
    processing: boolean // @TODO: The lock on the worker
    start: () => void
}

export enum WorkerStatus {
    'COMPLETED' = 'COMPLETED',
    'END' = 'END',
    'FAILED' = 'FAILED',
    'ERROR' = 'ERROR'
}

export type WorkerMessage = {
    workeridx: number 
    status: WorkerStatus
    pagination: ReadPagination
    errors?: [string]
}

/** ProcessContext */
//@TODO: wil be removed 
export type OffsetHistory = WorkerMessage

export type OffsetManagerContext = {
    startOffset?: number 
    history?: OffsetHistory[]
}

/** Application */
export type HandledReturn = [boolean, null | Error]