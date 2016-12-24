import ps from 'child_process';
import { Promise } from 'rsvp';
import _debug from 'debug';

import Message from './message';
import Serializable from './interfaces/serializable';

const debug = _debug('ara:worker');

let id = 0;
enum WorkerState {
  Terminated = 0,
  Running = 1
};

export default class Worker implements Serializable {
  id: Number;
  process: any;
  state: WorkerState;

  constructor(url) {
    this.requests = {};
    this.requestId = 1;
    this.id = id++;
    this.totalTime = 0;

    let worker = this;

    this.process = this.forkDebug(url);
    this.state = WorkerState.Running;

    this.process.on('message', (message) => this.receive(message));
  }

  receive(msg: Object) {
    let data = msg;
    let request = this.requests[data.requestId];

    if (request === undefined) {
      debug('Unknown request, something went wrong. payload: %s', msg);
      debug('unknown request, terminating worker#%d', this.id);
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
  }

  forkDebug(url: string) {
    // TODO: merge with existing process.execArgv;
    // TODO: make this ergonomic
    // TODO: make it optionally same process
    // let execArgv =  []; // fs.fork(url, { execArgv: ... });
    let execArgv = process.execArgv.slice();

    if (execArgv.indexOf('--debug-brk') > -1) {
      this.debugPort = process.debugPort + this.id + 1;
      execArgv.push('--debug=' + this.debugPort);
    }

    return ps.fork(url, { execArgv: execArgv });
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      state: this.state,
      totalTime: this.totalTime,
      pending: Object.keys(this.requests).length
    });
  }

  send(work: Message) {
    return new Promise((resolve, reject) => {
      let id = this.requestId++;

      this.requests[id] = {
        resolve,
        reject,
        start: Date.now()
      };

      debug('worker.process.send %o', {
        requestId: id,
        workerId: this.id
      });

      this.process.send({
        requestId: id,
        work,
      });
    });
  }

  terminate() {
    this.state = WorkerState.Terminated;
    // is this async? should we confirm?
    this.process.kill();
  }
}
