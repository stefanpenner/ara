import Token from './token';
import Message from '../interfaces/actor-message';
import uuid from 'node-uuid';
import { Promise, defer } from 'rsvp';
import Scheduler from '../interfaces/scheduler';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class Actor {
  id: string;
  token: Token;
  scheduler: Scheduler;
  state: Promise<any>;

  constructor(options = {}) {
    this.scheduler = options.scheduler || {};
    this.id = uuid.v4();
    this.state = defer(`actor-${this.id}-state`);
  }

  preStart() {}

  postStart() {}

  postStop() {}

  setResolved(state: any) {
    return this.state.resolve(state);
  }

  setRejected(state: any) {
    return this.state.reject(state);
  }

  getState() {
    return this.state;
  }

  send(message: Message) {
    this.token = this.scheduler.schedule(message);

    this.token.getEventualValue()
         .then(this.setResolved.bind(this))
         .catch(this.setRejected.bind(this));

    return this.state.promise;
  }

  gracefulStop(timeout): Promise<Boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.token.eventualValue.promise._state === void 0) {
          reject(false);
        } else {
          this.postStop();
          resolve(true);
        }
      }, timeout);
    });
  }

  receive() {}

  kill() {}
}
