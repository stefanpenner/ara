import Message from './message';
import uuid from 'node-uuid';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class Actor {
  constructor(system) {
    //if (!system) {
    //  throw new Error('Creating actor using `new` is not allowed.');
    //}

    this.parent = system;
    this.id = uuid.v4();
  }

  send() {}

  //async send(message) {
  //  let messageInstance = new Message({
  //    value: message
  //  });

  //  return this.parent.schedule(messageInstance);
  //}

  receive() {}

  kill() {}
}
