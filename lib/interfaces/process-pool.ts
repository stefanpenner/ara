import Worker from '../worker';
import Scheduler from './scheduler';

interface ProcessPool {
  workers: Array<Worker>;
  idle: Array<Worker>;
  maxPoolSize: Number;
  scheduler: Scheduler;
  workerTimeout: Number;
  isActivePoolEmpty(): Boolean;
  isIdlePoolEmpty(): Boolean;
  createWorker(): Worker;
  requestIdleWorker(): any;
  isActiveLimitReached(): Boolean;
  noop(): any;
  terminate(): Promise<Boolean>;
}

export default ProcessPool;
