import { Promise, defer } from 'rsvp';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

export default class Message {
  value: Object;
  actorPath: string;
  eventualValue: Promise<any>;

  constructor({ actorPath, value }) {
    this.value = value || {};
    this.actorPath = actorPath || '';
    this.eventualValue = defer();
  }

  getEventualValue(): Promise<any> {
    return this.eventualValue.promise;
  }
}
