type LockCallback = () => void

export class LockManager {
    public locked: boolean = false
    private queue: Array<LockCallback> = []
    
    public async lock(): Promise<void> {
        if (this.locked) {
            /** Elegant way to manage the next lock possibility using a queue */
            await new Promise(resolve => this.queue.push(resolve as LockCallback))
        }
        this.locked = true 
    }

    public async release(): Promise<void> {
        this.locked = false
        /** Get the next lock request and releases it */ 
        const resolver = this.queue.shift()
        if (resolver) resolver()
    }
}   

