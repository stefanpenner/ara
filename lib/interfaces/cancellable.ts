import { Promise } from 'rsvp';

interface Cancellable {
  cancel(): Promise<Boolean>;
  isCancelled: Boolean;
}

export default Cancellable;
