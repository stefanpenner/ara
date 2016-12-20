import maxCPU from './max-cpu';
import Worker from './worker';
import './ensure-promise';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class ProcessPool {
  constructor(options = {}) {
    this.workers = [];
    this.idle = [];
    this.mailboxQueue = [];
    this._maxCPU = options.maxCPU || maxCPU;
    // we need to make sure pool can operate w/o a scheduler
    this.scheduler = options.scheduler;
  }

  _createWorkerInstance() {
    return new Worker(`${__dirname}/runner.js`);
  }

  isWorkersPoolEmpty() {
    return this.workers.length === 0;
  }

  isIdlePoolEmpty() {
    return this.idle.length === 0;
  }

  isMaxWorkers() {
    return this.workers.length === this._maxCPU;
  }

  createWorker() {
    let worker = this._createWorkerInstance();
    this.workers.push(worker);
    this._becameIdle(worker);
    return worker;
  }

  async _executeWork(worker) {
    try {
      let work = this.scheduler.popWork();

      // this.schedule.pushActiveWork(work); // maintain a list of active work
      // this should change to 

      let value = await worker.do(work);
      // store state
      work.complete(value);
      // mail.deliver(address, valie);
      // system.send(this.address, value))

      this._becameIdle(worker);
    } catch (reason) {
      // store state
      work.failed(reason);
      // mail.failDelivery(reason);
      // this._crashed(worker, reason);
      throw reason;
    }
  }

  popIdleWorker() {
    this._executeWork(this.idle.pop());
  }

  _becameIdle(worker) {
    // console.log('pool:becameIdle');
    if (!this.scheduler.isMailboxEmpty()) {
      // console.log('pool:mailbox is not empty');
      this._executeWork(worker);
    } else {
      // console.log('pool:mailbox is empty');
      // ensure unique, maybe use fast-ordered-set
      this.idle.push(worker);
    }
  }

  _crashed(/*worker, reason*/) {
    // remove from workers
    // worker.terminate(); // ensure its dead
  }
}
