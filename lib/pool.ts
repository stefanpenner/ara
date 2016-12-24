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
  maxPoolSize: Number;
  scheduler: Scheduler;
  workerTimeout: Number;

  constructor(options: { maxPoolSize?: Number, scheduler: Scheduler }) {
    this.workers = [];
    this.idle = [];
    this.maxPoolSize = options.maxPoolSize || maxCPU;
    this.scheduler = options.scheduler;
  }

  _createWorkerInstance(): Worker {
    return new Worker(`${__dirname}/runner.js`);
  }

  isActivePoolEmpty(): Boolean {
    return this.workers.length === 0;
  }

  isIdlePoolEmpty(): Boolean {
    return this.idle.length === 0;
  }

  isActiveLimitReached(): Boolean {
    return this.workers.length === this.maxPoolSize;
  }

  noop() { }

  terminate(): Promise<Boolean> {
    return Promise.resolve(true);
  }

  createWorker(): Worker {
    let worker = this._createWorkerInstance();
    this.workers.push(worker);
    this._becameIdle(worker);
    return worker;
  }

  async _executeWork(worker: Worker): Promise<void> {
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

  requestIdleWorker(): void {
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
