import pino from 'pino'

export const logger = pino({
    msgPrefix: '[source-stream] - ', 
    level: 'debug',
    transport: { 
        target: 'pino-pretty', 
        options: { colorize: true }
    }
})
