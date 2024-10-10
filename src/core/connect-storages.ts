import { logger } from "../lib/pino";
import { HandledReturn, SourceStreamStorages } from "../types";

export async function connect2Storages (storages: SourceStreamStorages): Promise<HandledReturn> {
    try { 
        logger.info('Process will try to connect into storages')
        const { readStorage, writeStorage } = storages
        /** It can not work properly 
         * ! - if it does not change directly the pointer of connect 
         * probably will not affect other instances  
        */
        await Promise.all([readStorage.connect(), writeStorage.connect()])
        return [true, null]
    } catch (error) {
        logger.error('A error ocurred trying to establish the connection with storages')
        throw error
    }
}