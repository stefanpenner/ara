import Pool from './interfaces/process-pool';
import Scheduler from './interfaces/scheduler';

import maxCPU from './max-cpu';
import Worker from './worker';
import './ensure-promise';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class ProcessPool implements Pool {
  workers: Array<Worker>;
  idle: Array<Worker>;
  maxCPU: Number;
  scheduler: Scheduler;

  constructor(options = {}) {
    this.workers = [];
    this.idle = [];
    this.maxCPU = options.maxCPU || maxCPU;
    this.scheduler = options.scheduler;
  }

  _createWorkerInstance() {
    return new Worker(`${__dirname}/runner.js`);
  }

  isActivePoolEmpty() {
    return this.workers.length === 0;
  }

  isIdlePoolEmpty() {
    return this.idle.length === 0;
  }

  isActiveLimitReached() {
    return this.workers.length === this.maxCPU;
  }

  noop() { }

  createWorker() {
    let worker = this._createWorkerInstance();
    this.workers.push(worker);
    this._becameIdle(worker);
    return worker;
  }

  async _executeWork(worker) {
    let work = this.scheduler.nextMessage();

    try {
      let value = await worker.send(work);

      work.eventualValue.resolve(value);

      this._becameIdle(worker);
    } catch (reason) {
      work.eventualValue.reject(reason);

      // this._crashed(worker, reason);
    }
  }

  requestIdleWorker() {
    this._executeWork(this.idle.pop());
  }

  _becameIdle(worker) {
    if (this.scheduler.isFree()) {
      this._executeWork(worker);
    } else {
      // ensure unique, maybe use fast-ordered-set
      this.idle.push(worker);
    }
  }

  _crashed(/*worker, reason*/) {
    // remove from workers
    // worker.terminate(); // ensure its dead
  }
}
