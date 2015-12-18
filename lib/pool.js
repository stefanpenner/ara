import maxCPU from './max-cpu';
import './ensure-promise';
import regeneratorRuntime from 'regenerator/runtime-module';

export default class Pool {
  constructor(options) {
    this.j = options.j || maxCPU;
    this.workers = [];
    this.idle = [];
    this.pendingWork = [];
  }

  popIdleWorker() {
    //
  }

  async run(work) {
    let worker = await this.popIdleWorker();

    try {
      let value = await worker.run(work);
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
