import { Promise, defer } from 'rsvp';
import Message from './message';
import Cancellable from '../interfaces/cancellable';

export default class Token implements Cancellable {
  eventualValue: Promise<any>;
  runnable: Message;

  constructor(message: Message) {
    this.eventualValue = defer();
    this.runnable = message;
  }

  getEventualValue() {
    return this.eventualValue.promise;
  }

  cancel() {
    return this.eventualValue.reject();
  }
}
