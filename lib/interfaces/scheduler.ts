import ProcessPool from './process-pool';
import Message from '../message';

interface Scheduler {
  workQueue: Array<Message>;
  processPool: ProcessPool;
  nextMessage(): Message;
  isFree(): Boolean;
  queue(message: Message): Promise<any>
}

export default Scheduler;
