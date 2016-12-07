import maxCPU from './max-cpu';
import { defer } from 'rsvp';
import ProcessPool from './pool';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class SimpleScheduler {
  constructor() {
    this.mailboxQueue = [];
    this.processPool = new ProcessPool({ scheduler: this });
  }

  popNextMail() {
    return this.mailboxQueue.pop();
  }

  isMailboxEmpty() {
    return this.mailboxQueue.length === 0;
  }

  runSchedule() {
    console.log('scheduler:startWork');
    // have we reached max workers?
    if (this.processPool.isMaxWorkers()) {
      console.log('scheduler:max workers');
      if (!this.processPool.isIdlePoolEmpty()) {
        console.log('scheduler:idle pool is not empty');
        // claim the worker and work
        this.processPool.popIdleWorker();
      } else {
        console.log('scheduler:idle pool is empty');
        // noop, wait until worker claims work
      }
    } else {
      // create a new worker
      console.log('scheduler:create new worker');
      this.processPool.createWorker();
    }
  }

  async queueWork({ value, receive }) {
    let mail = {
      defer: defer(),
      value,
      receive
    };
    console.log('scheduler:pushToMailbox');

    this.mailboxQueue.push(mail);
    this.runSchedule();

    return mail.defer.promise;
  }
}
