import { Promise, defer } from 'rsvp';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class Message {
  constructor({ actorPath, value }) {
    this.value = value || {};
    this.actorPath = actorPath || '';
    this.eventualValue = defer();
  }

  async getEventualValue() {
    return this.eventualValue.promise;
  }
}
