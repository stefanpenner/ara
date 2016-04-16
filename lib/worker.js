import ps from 'child_process';
import { Promise } from 'rsvp';
import _debug from 'debug';
import serializeWork from './serialize-work';

const debug = _debug('para:worker');

let id = 0;
const TERMINATED = 0;
const RUNNING = 1;

export default class Worker {
  constructor(url) {
    this.requests = {};
    this.requestId = 1;
    this.id = id++;
    this.totalTime = 0;

    let execArgv = process.execArgv.slice();
    if (process.debugPort) {
      this.debugPort = process.debugPort + this.id;
      execArgv.push('--debug=' + this.debugPort);
    }


    let worker = this;

    // TODO: merge with existing process.execArgv;
    // TODO: make this ergonomic
    // TODO: make it optionally same process
    // let execArgv =  []; // fs.fork(url, { execArgv: ... });
    this.process = ps.fork(url, { execArgv: execArgv });
    this.state = RUNNING;

    // TODO: extract handler for improved unit testing
    this.process.on('message', (msg) => {
      let data = JSON.parse(msg);
      let request = worker.requests[data.requestId];

      if (request === undefined) {
        debug('Unknown request, something went wrong. payload: %s', msg);
        debug('unknown request, terminating worker#%d', worker.id);
        // TODO: ... ?
        this.terminate(); // is this needed?
        return;
      }

      delete this.requests[data.requestId];

      let took = Date.now() - request.start;

      this.totalTime += took;

      debug('worker: %d, job: %d, took: %dms', this.id, data.requestId, took);
      debug('worker: %d, job: %d, payload: %o', this.id, data.requestId, data);

      if ('value' in data) {
        return request.resolve(data.value);
      } else if ('reason' in data) {
        return request.reject(data.reason);
      } else {
        throw new Error('message had neither, value or reason: ' + JSON.stringify(data));
      }
    });
  }

  toJSON() {
    return {
      id: this.id,
      state: this.state,
      totalTime: this.totalTime,
      pending: Object.keys(this.requests).length
    };
  }

  run(work, arg) {
    return new Promise((resolve, reject) => {
      let id = this.requestId++;

      this.requests[id] = {
        resolve: resolve,
        reject: reject,
        start: Date.now()
      };

      debug('worker.process.send %o', {
        requestId: id,
        workerId: this.id
      });

      this.process.send(JSON.stringify({
        requestId: id,
        work: serializeWork(work),
        arg: arg
      })); // TODO: callback?
    });
  }

  terminate() {
    this.state = TERMINATED;
    // is this async? should we confirm?
    this.process.kill();
  }
}
