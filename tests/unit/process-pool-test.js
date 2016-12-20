import ProcessPool from '../../lib/pool';
import { expect } from 'chai';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

describe('ProcessPool', ()  => {
  var processPool;

  beforeEach(() => {
    processPool = new ProcessPool({
      maxCPU: 2
    });
    // remove this and use test double
    processPool._createWorkerInstance = () => {
      return {
        run() {
          return 1;
        }
      };
    };
  });

  afterEach(() => {
    processPool = null;
  });

  it('has correct defaults', () => {
    expect(processPool.workers).to.deep.equal([]);
    expect(processPool.idle).to.deep.equal([]);
  });

  it('`maxCPU` number can be passed via constructor', () => {
    expect(processPool._maxCPU).to.eq(2);
  });

  it('`isInboxEmpty` returns true if inbox queue is empty, otherwise false', async function() {
    expect(processPool.isInboxEmpty()).to.be.true;

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    expect(processPool.isInboxEmpty()).to.be.false;
  });

  it('`isWorkersPoolEmpty` returns true if workers pool is empty, otherwise false', async function() {
    expect(processPool.isWorkersPoolEmpty()).to.be.true;

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    expect(processPool.isWorkersPoolEmpty()).to.be.false;
  });

  it('`isMaxWorkers` returns true if workers pool is at capacity, otherwise false', async function() {
    expect(processPool.isMaxWorkers()).to.be.false;

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    expect(processPool.isMaxWorkers()).to.be.true;
  });

  it('`isIdlePoolEmpty` returns true if idle workers pool is empty, otherwise false', async function() {
    expect(processPool.isIdlePoolEmpty()).to.be.true;

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    expect(processPool.isIdlePoolEmpty()).to.be.false;
  });

  it('`schedule` creates no more than `maxCPU` workers', async function() {
    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    expect(processPool.workers.length).to.eq(2);
  });

  it('`schedule` pushes work into `inbox` if there are no idle workers', async function() {
    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    await processPool.schedule({
      value: '',
      receive() { return 1; }
    });

    expect(processPool.inbox.length).to.eq(2);
  });
});
