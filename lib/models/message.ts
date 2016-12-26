import ActorMessage from '../interfaces/actor-message';

export default class Message implements ActorMessage {
  meta: Object;
  properties: Object;

  constructor({ meta = {}, properties = {} }) {
    this.meta = meta;
    this.properties = properties;
  }
}
