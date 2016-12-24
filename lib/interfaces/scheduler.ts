import ProcessPool from './process-pool';
import Message from '../message';

interface Scheduler {
  workQueue: Array<Message>;
  processPool: ProcessPool;
  nextMessage(): Message;
  isFree(): Boolean;
  schedule(message: Message): Promise<any>
}

export default Scheduler;
