import Pool from '../interfaces/process-pool';
import Scheduler from '../interfaces/scheduler';
import { Promise } from 'rsvp';
import maxCPU from '../utils/max-cpu';
import Worker from './worker';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class ProcessPool implements Pool {
  workers: Array<Worker>;
  idle: Array<Worker>;
  running: Array<Worker>;
  maxPoolSize: Number;
  scheduler: Scheduler;
  workerTimeout: Number;

  constructor(options: { maxPoolSize?: Number, scheduler: Scheduler }) {
    this.workers = [];
    this.idle = [];
    this.running = [];
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

  isRunningPoolEmpty(): Boolean {
    return this.running.length === 0;
  }

  noop() { }

  terminate(): Promise<Boolean> {
    return Promise.resolve(true);
  }

  createWorker(): Worker {
    let worker = this._createWorkerInstance();
    this.workers.push(worker);
    //console.log(`👷 create worker ${worker.id}`);
    this._executeWork(worker);
    return worker;
  }

  async _executeWork(worker: Worker): Promise<void> {
    let work = this.scheduler.nextMessage();

    if (!work) { return; }

    try {
      this.running.push(worker);

      let value = await worker.send(work.runnable);

      work.eventualValue.resolve(value);

      //console.log(`👷 worker ${worker.id} is done with work`);

      //this._becameIdle(worker);
    } catch (reason) {
      work.eventualValue.reject(reason);
    }

    this.running.shift();
  }

  requestIdleWorker(): void {
    let worker = this.workers.shift();
    //console.log(`👷 request idle worker ${worker.id}`);
    this._executeWork(worker);
    this.workers.push(worker);
  }

  _becameIdle(worker) {
    this.idle.push(worker);
    //console.log(`worker ${worker.id} became idle; (idle queue: ${this.idle.length})`);
  }

  _crashed(/*worker, reason*/) {
    // remove from workers
    // worker.terminate(); // ensure its dead
  }
}
