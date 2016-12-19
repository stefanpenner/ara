import uuid from 'node-uuid';
import { defer } from 'rsvp';

export default class Message {
  constructor({ message, receive }) {
    this.id = uuid.v4();
    this.value = message;
    this.receive = receive;
    this._eventualValue = defer();
  }

  getEventualValue() {
    return this._eventualValue.promise;
  }

  deliver(message) {
    return this._eventualValue.resolve(message);
  }

  failDelivery(message) {
    return this._eventualValue.reject(message);
  }
}
