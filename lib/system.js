import path from 'path';
import Message from './message';
import ActorReference from './actor-reference';
import Scheduler from './simple-scheduler';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class System {
  constructor() {
    this.scheduler = new Scheduler();
  }

  async schedule(messageInstance) {
    return this.scheduler.queue(messageInstance);
  }

  actorOf(requireActorPath = '') {
    if (actorPath === '') {
      throw new Error('You must specify a path to an actor.');
    }

    let system = this;
    let actorPath = path.join(process.cwd(), requireActorPath);

    return new ActorReference({
      actorPath,
      system
    });
  }
}
