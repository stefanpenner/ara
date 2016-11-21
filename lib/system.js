import Actor from './actor';
import _debug from 'debug';
import ProcessPool from './process-pool';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

const debug = _debug('ara:system');

export default class System {
  constructor() {
    this.processPool = new ProcessPool();
  }

  async schedule() {
    debug('system.schedule');
    return this.processPool.ask(...arguments);
  }

  actorOf(Type = Actor) {
    return new Type(this);
  }
}
