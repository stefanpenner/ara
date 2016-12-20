import ProcessPool from './pool';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class SimpleScheduler {
  constructor() {
    this.workQueue = [];
    this.processPool = new ProcessPool({ scheduler: this });
  }

  popWorker() {
    return this.mailboxQueue.pop();
  }

  hasWork() {
    return this.mailboxQueue.length !== 0;
  }

  runSchedule() {
    // console.log('scheduler:startWork');
    // have we reached max workers?
    if (this.processPool.isMaxWorkers()) {
      // console.log('scheduler:max workers');
      if (!this.processPool.isIdlePoolEmpty()) {
        // console.log('scheduler:idle pool is not empty');
        // claim the worker and work
        this.processPool.popIdleWorker();
      } else {
        // console.log('scheduler:idle pool is empty');
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
      // console.log('scheduler:create new worker');
      this.processPool.createWorker();
    }
  }

  async queueWork(messageInstance) {
    // console.log('scheduler:pushToMailbox');

    this.mailboxQueue.push(messageInstance);
    this.runSchedule();

    return messageInstance.getEventualValue();
  }
}
