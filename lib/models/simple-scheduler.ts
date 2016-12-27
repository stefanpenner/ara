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
    console.log(`🕐 schedule (queue: ${this.workQueue.length})`);

    if (this.processPool.isActiveLimitReached()) {
      if (!this.processPool.isIdlePoolEmpty()) {
        this.processPool.requestIdleWorker();
      } else {
        this.processPool.noop();
      }
    } else {
      this.processPool.createWorker();
    }

    return token;
  }
}
