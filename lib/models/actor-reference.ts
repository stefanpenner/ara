import uuid from 'node-uuid';
import Message from './message';
import PoisonPill from './poison-pill';
import Actor from './actor';
import ActorRef from '../interfaces/actor-ref';
import Serializable from '../interfaces/serializable';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class ActorReference implements ActorRef, Serializable {
  actor: Actor;
  actorPath: String;
  constructorProperties: any;
  id: String;

  constructor({ actorPath, constructorProperties, actor }) {
    this.actor = actor;
    this.actorPath = actorPath;
    this.constructorProperties = constructorProperties;
    this.id = uuid.v4();
  }

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      constructorProperties: this.constructorProperties,
      actorPath: this.actorPath
    });
  }

  tell(message: Message): void {
    this.send(message);
  }

  send(message: any): Promise<any> {
    let value = message;
    let constructorProperties = this.constructorProperties;
    let actorPath = this.actorPath;

    return this.actor.send(
      new Message({
        meta: { actorPath, constructorProperties },
        properties: {
          value: message
        }
      })
    );
  }

  gracefulStop(timeout) {
    return this.actor.gracefulStop(timeout);
    // return this.actor.send(new PoisonPill());
  }

  kill(): Promise<any> {
    return Promise.resolve(true);
  }
}
