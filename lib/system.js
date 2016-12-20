import path from 'path';
import Message from './message';
import Scheduler from './simple-scheduler';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

// const debug = _debug('ara:system');

export default class System {
  constructor() {
    this.scheduler = new Scheduler();
  }

  async schedule(message) {
    return this.scheduler.queueWork(message);
  }

  actorOf(actorPath = '') {
    if (actorPath === '') {
      throw new Error('You must specify a path to an actor.');
    }

    let requirePath = path.join(process.cwd(), actorPath);
    const Type = require(requirePath);

    return new Type(this);
  }
}
