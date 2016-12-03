import Actor from './actor';
import _debug from 'debug';
import ProcessPool from './pool';
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
    return this.processPool.schedule(...arguments);
  }

  actorOf(Type = Actor) {
    return new Type(this);
  }
}
