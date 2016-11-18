import maxCPU from './max-cpu';
import Worker from './worker';
import './ensure-promise';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

// TODO: this file is just a brainstorm sketch, it actually needs to be
// implemented.

export default class Pool {
  constructor(options) {
    // this.j = options && options.j || maxCPU;
    this.workers = [];
    this.idle = [];
    this.pendingWork = [];
  }

  popIdleWorker() {
    // return this.workers.pop();
    return new Worker('./dist/runner.js');
  }

  async run({ value, receive }) {
    let worker = await this.popIdleWorker();

    try {
      let value = await worker.run(receive, value);
      this._becameIdle(worker);
      return value;
    } catch(reason) {
      this._crashed(worker, reason);
      throw reason;
    }
  }

  _becameIdle(worker) {
    this.idle.push(worker); // ensure unique, maybe use fast-ordered-set
  }

  _crashed(worker) {
    // remove from workers
    worker.terminate(); // ensure its dead
  }
}
