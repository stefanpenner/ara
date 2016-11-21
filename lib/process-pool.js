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
    this.inbox = [];
  }

  isIdlePoolEmpty() {
    return this.idle.length === 0;
  }

  isWorkersPoolEmpty() {
    return this.workers.length === 0;
  }

  popIdleWorker() {
    if (this.isIdlePoolEmpty() && this.isWorkersPoolEmpty()) {
      let worker = new Worker(`{__dirname}/runner.js`);
      this.idle.push(worker);
      this.workers.push(worker);
    } else if (this.isIdlePoolEmpty()) {
      // this means all workers are busy
      setTimeout(() => {
        return this.schedule();
      }, 0);
    }
    return this.idle.pop();
  }

  async schedule() {
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

  async ask(arg) {
    this.inbox.push(arg);
    return this.schedule();
  }

  // async run({ value, receive }) {
    // let token = this.schedule();
    // let worker = await this.popIdleWorker();

    // return this.executeWithToken(token);
    // return this.execute({ value, receive });

    // try {
    //   let value = await worker.run(receive, value);
    //   this._becameIdle(worker);
    //   return value;
    // } catch(reason) {
    //   this._crashed(worker, reason);
    //   throw reason;
    // }
  // }

  _becameIdle(worker) {
    this.idle.push(worker); // ensure unique, maybe use fast-ordered-set
  }

  _crashed(worker) {
    // remove from workers
    worker.terminate(); // ensure its dead
  }
}
