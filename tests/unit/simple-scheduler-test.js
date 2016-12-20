import SimpleScheduler from '../../lib/simple-scheduler';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

chai.use(chaiAsPromised);

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

  it('`runSchedule` should ask process pool to create a worker if max worker limit is not reached', function () {
    expect(1).to.eql(2);
  });

  it('`runSchedule` should ask process pool to claim worker if max worker limit is reached and idle worker are available', function () {
    expect(1).to.eql(2);
  });

  it('`runSchedule` should result in a no-op if all the workers are busy and max worker limit is reached', function () {
    expect(1).to.eql(2);
  });

  it('`popNextMail` should return you the next item in mailbox queue', function() {
    expect(1).to.eql(2);
  });

  it('`isMailboxEmpty` should return true is mailbox is empty and false otherwise', function() {
    expect(1).to.eql(2);
  });
});
