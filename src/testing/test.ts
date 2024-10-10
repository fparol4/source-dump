import { Worker } from 'worker_threads'
import { log } from 'console'
import { StreamWorker } from '../core/stream-worker'

const WORKER_PATH = './src/lib/worker.ts'

// Now test it with the Worker that we have created

const workeridx = 1
const streamWorker = new StreamWorker(workeridx)

// const streamWorker = { idx: 1 }
const worker = new Worker(WORKER_PATH)
log('Will post message')
worker.postMessage({ id: workeridx })

/**
 * Pontos:
 * 1. A função run DEVE estar dentro do `worker.js`
 * 2. 
 */







// const worker = new Worker('./src/lib/worker.ts')
// log('Will post message')
// worker.postMessage({ id: 1 })
// log('Message send')


// worker.on('message', (message) => {
//     log('Received from: ', message)
//     worker.terminate()
// })

