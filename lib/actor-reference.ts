import uuid from 'node-uuid';
import Message from './message';
import System from './system';
import ActorRef from './interfaces/actor-ref';
import Serializable from './interfaces/serializable';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class ActorReference implements ActorRef, Serializable {
  system: System;
  actorPath: String;
  id: String;

  constructor({ actorPath, system }) {
    this.system = system;
    this.actorPath = actorPath;
    this.id = uuid.v4();
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      actorPath: this.actorPath
    });
  }

  tell(message: Message): void {
    this.send(message);
  }

  async send(message: Message): Promise<any> {
    let value = message;
    let actorPath = this.actorPath;

    return this.system.send(
      new Message({ actorPath, value })
    );
  }

  kill(): Promise<any> {
    return Promise.resolve(true);
  }
}
