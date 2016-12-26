import ProcessPool from './process-pool';
import Token from '../token';
import Message from '../message';

interface Scheduler {
  workQueue: Array<Message>;
  processPool: ProcessPool;
  nextMessage(): Token;
  isFree(): Boolean;
  schedule(message: Message): Token
}

export default Scheduler;
