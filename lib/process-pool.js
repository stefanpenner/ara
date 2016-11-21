// import maxCPU from './max-cpu';
import Worker from './worker';
import './ensure-promise';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

// TODO: this file is just a brainstorm sketch, it actually needs to be
// implemented.

const maxCPU = 4;

export default class Pool {
  constructor(options) {
    // this.j = options && options.j || maxCPU;
    this.workers = [];
    this.idle = [];
    // this.inbox = [];
  }

  isIdlePoolEmpty() {
    return this.idle.length === 0;
  }

  isWorkersPoolEmpty() {
    return this.workers.length === 0;
  }

  isMaxWorkers() {
    return this.workers.length === maxCPU;
  }

  popWorker() {
    let firstIndex = 0;
    let lastIndex = this.workers.length - 1;

    let result = this.workers[lastIndex];

    [
      this.workers[firstIndex],
      this.workers[lastIndex]
    ] = [
      this.workers[lastIndex],
      this.workers[firstIndex]
    ];

    return result;
  }

  popIdleWorker() {
    return new Promise((resolve, reject) => {
      if (this.isWorkersPoolEmpty()) {
        let worker = new Worker(`${__dirname}/runner.js`);
        console.log('ara:schedule - first run new worker');
        this.workers.push(worker);
        this.idle.push(worker);
        resolve(worker);
      }

      if (this.isIdlePoolEmpty()) {
        // this means all workers are busy
        console.log('ara:schedule - busy');
        setTimeout(() => {
          return resolve(this.popIdleWorker());
        }, 1);
      } else {
        let worker;

        if (this.isMaxWorkers()) {
          console.log('ara:schedule - max workers');
          worker = this.popWorker();
        } else {
          worker = new Worker(`${__dirname}/runner.js`);
          console.log('ara:schedule - new worker');
          this.workers.push(worker);
        }

        // remove worker from idle pool
        //
        resolve(worker);
      }
    });
  }

  async schedule({ value, receive }) {
    console.log('ara:schedule');
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
    // this.inbox.push(arg);
    return this.schedule(...arguments);
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

  _crashed(worker, reason) {
    // remove from workers
    console.log(worker);
    worker.terminate(); // ensure its dead
    console.log(reason);
  }
}
