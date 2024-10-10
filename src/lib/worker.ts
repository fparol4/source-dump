const path = require('path')
const StreamWorkerPath = path.resolve(__dirname, '../core/stream-worker.ts')
console.log(StreamWorkerPath)

const { parentPort } = require('worker_threads');
const { StreamWorker } = require(StreamWorkerPath)


parentPort?.on('message', (message) => {
    const { streamWorker } = message 
    console.log(streamWorker.run)
    console.log('received ->', message)
})
