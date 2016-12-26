import Message from './message';
import uuid from 'node-uuid';
import { defer } from 'rsvp';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class Actor {
  id: string;
  state: Promise<any>;

  constructor(system) {
    //if (!system) {
    //  throw new Error('Creating actor using `new` is not allowed.');
    //}

    this.system = system;
    this.id = uuid.v4();
    this.state = defer();
  }

  preStart() {}

  postStart() {}

  setResolved(state: any) {
    this.state.resolve(state);
  }

  setRejected(state: any) {
    this.state.reject(state);
  }

  send(message: Message) {
    this.system.send(message);
  }

  //async send(message) {
  //  let messageInstance = new Message({
  //    value: message
  //  });

  //  return this.parent.schedule(messageInstance);
  //}

  receive() {}

  kill() {}
}
