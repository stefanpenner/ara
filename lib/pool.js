import maxCPU from './max-cpu';

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

  run(work) {
    return this.popIdleWorker().then((worker) => {
      return worker.run(work).then((value) => {
        this._becameIdle(worker);
        return value;
      }, function(reason) {
        this._crashed(worker);
        throw reason;
      });
    });
  }

  _becameIdle(worker) {
    this.idle.push(worker); // ensure unique, maybe use fast-ordered-set
  }

  _crashed(worker) {
    // remove from workers
    worker.terminate(); // ensure its dead
  }
}
