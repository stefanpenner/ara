import SimpleScheduler from '../../lib/pool';
import chai from 'chai';
// import { Promise } from 'rsvp';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

const { expect } = chai;

describe('simple scheduler', function() {
  let scheduler;

  before(() => {
    scheduler = new SimpleScheduler();
  })

  it('has an empty mailbox queue by default', function() {
    expect(scheduler.mailboxQueue).to.deep.equal([]);
  });

  it('has a process pool instance by default', function() {
    expect(scheduler.processPool).to.exist;
  })

  it('`queueWork` adds a message to mailbox and returns a promise', function () {
    let message = {
      value: 'foobarz'
    };
    let eventualValue = scheduler.queueWork(message);

    expect(eventualValue.then).to.exist;
    expect(scheduler.mailboxQueue.length).to.equal(1);
  });
});
