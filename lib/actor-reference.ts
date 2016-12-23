import uuid from 'node-uuid';
import Message from './message';
import System from './system';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class ActorReference {
  system: System;
  actorPath: String;
  id: String;

  constructor({ actorPath, system }) {
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
