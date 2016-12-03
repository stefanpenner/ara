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
    this.inbox = [];
    this._maxCPU = options.maxCPU || maxCPU;
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

  _createWorker() {
    let worker = this._createWorkerInstance();
    this.workers.push(worker);
    this.idle.push(worker);
    return worker;
  }

  async schedule({ value, receive }) {
    if (this.isMaxWorkers() || this.isIdlePoolEmpty() && !this.isWorkersPoolEmpty()) {
      this.inbox.push({ value, receive });
    } else {
      return this._createWorker();
    }
  }

  async ask() {

  }
}

// export default class Pool {
//   constructor(options) {
//     // this.j = options && options.j || maxCPU;
//     this.workers = [];
//     this.idle = [];
//     // this.inbox = [];
//   }

//   isIdlePoolEmpty() {
//     return this.idle.length === 0;
//   }

//   isWorkersPoolEmpty() {
//     return this.workers.length === 0;
//   }

//   isMaxWorkers() {
//     return this.workers.length === maxCPU;
//   }

//   popWorker() {
//     let firstIndex = 0;
//     let lastIndex = this.workers.length - 1;

//     let result = this.workers[lastIndex];

//     [
//       this.workers[firstIndex],
//       this.workers[lastIndex]
//     ] = [
//       this.workers[lastIndex],
//       this.workers[firstIndex]
//     ];

//     return result;
//   }

//   async popIdleWorker() {
//     if (this.isWorkersPoolEmpty()) {
//       let worker = new Worker(`${__dirname}/runner.js`);
//       this.workers.push(worker);
//       this.idle.push(worker);
//       return worker;
//     }

//     if (this.isIdlePoolEmpty()) {
//       // this means all workers are busy
//       setTimeout(() => {
//         return this.popIdleWorker();
//       }, 1);
//     } else {
//       let worker;

//       if (this.isMaxWorkers()) {
//         worker = this.popWorker();
//       } else {
//         worker = new Worker(`${__dirname}/runner.js`);
//         this.workers.push(worker);
//       }

//       // remove worker from idle pool
//       return worker;
//     }
//   }

//   async schedule({ value, receive }) {
//     let worker = await this.popIdleWorker();

//     try {
//       // let value = await scheduler.execute(receive, value);
//       let value = await worker.run(receive, value);
//       this._becameIdle(worker);
//       return value;
//     } catch(reason) {
//       this._crashed(worker, reason);
//       throw reason;
//     }
//   }

//   async ask(arg) {
//     // this.inbox.push(arg);
//     return this.schedule(...arguments);
//   }

//   _becameIdle(worker) {
//     this.idle.push(worker); // ensure unique, maybe use fast-ordered-set
//   }

//   _crashed(worker, reason) {
//     // remove from workers
//     worker.terminate(); // ensure its dead
//   }
// }
