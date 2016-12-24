import Scheduler from './interfaces/scheduler';
import Message from './message';
import ProcessPool from './pool';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class SimpleScheduler implements Scheduler {
  workQueue: Array<Message>;
  processPool: ProcessPool;

  constructor() {
    this.workQueue = [];
    this.processPool = new ProcessPool({ scheduler: this });
  }

  nextMessage() {
    return this.workQueue.pop();
  }

  isFree() {
    return this.workQueue.length !== 0;
  }

  async schedule(message: Message): Promise<any> {
    this.workQueue.push(message);

    // have we reached max workers?
    if (this.processPool.isActiveLimitReached()) {
      if (!this.processPool.isIdlePoolEmpty()) {
        // claim the worker and work
        this.processPool.requestIdleWorker();
      } else {
        // noop, wait until worker claims work
        // it might make sense to have a no-op function
        // that would just log a no-op
        // we should be able to make a change to heimdalljs
        // that will allow us to plot no-op operations onto
        // timeline so we can see how frequently our system
        // stays idle
        this.processPool.noop();
      }
    } else {
      // create a new worker
      this.processPool.createWorker();
    }

    return message.getEventualValue();
  }
}
