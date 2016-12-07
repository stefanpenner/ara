import Actor from './actor';
import _debug from 'debug';
import ProcessPool from './pool';
import Scheduler from './simple-scheduler';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

const debug = _debug('ara:system');

export default class System {
  constructor() {
    this.scheduler = new Scheduler();
  }

  async schedule() {
    debug('system.schedule');
    console.log('system.schedule');

    return this.scheduler.queueWork(...arguments);
    // return this.processPool.schedule(...arguments);
  }

  actorOf(Type = Actor) {
    return new Type(this);
  }
}
