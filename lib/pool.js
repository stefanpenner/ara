import maxCPU from './max-cpu';
import Worker from './worker';
import './ensure-promise';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

// TODO: this file is just a brainstorm sketch, it actually needs to be
// implemented.

/*
  actor => system => scheduler => pool

  Pool
  ====
  is pool not empty?
    idle workers exist
      pop the worker and give it work to do
      mark it idle once it is done with work
    idle workers do not exist
  is pool empty?
    create a worker and push it onto the queue
*/

export default class ProcessPool {
  constructor(options = {}) {
    this.workers = [];
    this.idle = [];
    this.mailboxQueue = [];
    this._maxCPU = options.maxCPU || maxCPU;
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
      let {
        receive,
        value,
        defer: { resolve, reject }
      } = this.scheduler.popNextMail();

      let eventualValue = await worker.run(receive, value);
      resolve(eventualValue);

      this._becameIdle(worker);
    } catch (reason) {
      reject(reason);
      // this._crashed(worker, reason);
      throw reason;
    }
  }

  popIdleWorker() {
    this._executeWork(this.idle.pop());
  }

  _becameIdle(worker) {
    console.log('pool:becameIdle');
    if (!this.scheduler.isMailboxEmpty()) {
      console.log('pool:mailbox is not empty');
      this._executeWork(worker);
    } else {
      console.log('pool:mailbox is empty');
      // ensure unique, maybe use fast-ordered-set
      this.idle.push(worker);
    }
  }

  _crashed(worker, reason) {
    // remove from workers
    // worker.terminate(); // ensure its dead
  }
}
