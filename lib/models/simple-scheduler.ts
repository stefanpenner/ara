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

  push(message: Message) {
    let token = new Token(message);

    this.workQueue.push(token);

    return token;
  }

  schedule(message: Message): Token {
    let token = this.push(message);

    //console.log(`🕐 schedule (queue: ${this.workQueue.length})`);

    if (!this.processPool.isActiveLimitReached()) {
      this.processPool.createWorker()
    } else {
      if (this.processPool.isRunningPoolEmpty()) {
        //console.log('request worker');
        this.processPool.requestIdleWorker();
      } else {
        //console.log('noop');
        this.processPool.noop();
      }
    }

    return token;
  }
}
