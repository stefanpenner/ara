// import { Promise } from 'rsvp';
import CoreObject from 'core-object';
import uuid from 'node-uuid';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */
import _debug from 'debug';

const debug = _debug('actor');

export default class Actor extends CoreObject {
  init(system) {
    debug('create');
    if (!system) {
      throw new Error('Creating actor using `new` is not allowed.');
    }

    this.parent = system;
    this.id = uuid.v4();
  }

  async ask(message) {
    let receive = this.receive;
    /*
      direct all messages to parent (system) as it should know
      how to schedule work using process pool & workers.
    */
    return this.parent.schedule({ message, receive });
  }
}
