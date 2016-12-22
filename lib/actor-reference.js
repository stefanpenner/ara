import uuid from 'node-uuid';
import Message from './message';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class ActorReference {
  constructor({ actorPath, system }) {
    if (!system) {
      throw new Error('Creating actor reference using `new` is not allowed.');
    }

    this.system = system;
    this.actorPath = actorPath;
    this.id = uuid.v4();
  }

  async send(message) {
    let value = message;
    let actorPath = this.actorPath;

    return this.system.schedule(
      new Message({ actorPath, value })
    );
  }

  kill() { }
}
