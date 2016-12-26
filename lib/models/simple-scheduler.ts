import Scheduler from '../interfaces/scheduler';
import Token from './token';
import Message from './message';
import ProcessPool from './pool';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class SimpleScheduler implements Scheduler {
  workQueue: Array<Token>;
  processPool: ProcessPool;

  constructor() {
    this.workQueue = [];
    this.processPool = new ProcessPool({ scheduler: this });
  }

  nextMessage() {
    return this.workQueue.shift();
  }

  isFree() {
    let result = this.workQueue.length === 0;
    // console.log(`scheduler.isFree ${result} (queue: ${this.workQueue.length})`);
    return result;
  }

  schedule(message: Message): Token {
    let token = new Token(message);

    this.workQueue.push(token);
    // console.log(`🕐 schedule (queue: ${this.workQueue.length})`);

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

    return token;
  }
}
