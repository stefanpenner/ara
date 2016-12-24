import Message from '../message';

interface ActorRef {
  id: String;
  actorPath: String;

  send(message: Message): Promise<any>
  tell(message: Message): void
  kill(): Promise<any>
}

export default ActorRef;
