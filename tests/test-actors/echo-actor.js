import Actor from '../../lib/actor';

export default class EchoActor extends Actor {
  receive(message: Object) {
    return message;
  }
}
