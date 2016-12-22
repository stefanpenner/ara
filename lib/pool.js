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
    let work = this.scheduler.nextMessage();

    try {
      let value = await worker.send(work);

      work.eventualValue.resolve(value);

      this._becameIdle(worker);
    } catch (reason) {
      work.eventualValue.reject(reason);

      this._crashed(worker, reason);
    }
  }

  popIdleWorker() {
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
