import Worker from '../worker';
import Scheduler from './scheduler';

interface ProcessPool {
  workers: Array<Worker>;
  idle: Array<Worker>;
  maxCPU: Number;
  scheduler: Scheduler;
  isActivePoolEmpty(): Boolean;
  isIdlePoolEmpty(): Boolean;
  createWorker(): Worker;
  requestIdleWorker(): any;
  isActiveLimitReached(): Boolean;
  noop(): any;
}

export default ProcessPool;
