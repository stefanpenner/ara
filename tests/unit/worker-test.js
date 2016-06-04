import Worker from '../../lib/worker';
import chai from 'chai';
import { Promise } from 'rsvp';
import regeneratorRuntime from 'regenerator-runtime';

const { expect } = chai;

chai.Assertion.addProperty('ACTIVE', function() {
  let name = 'worker#' + this._obj.id;

  this.assert(this._obj.state === 1,
              'expected ' + name + ' to be active(1), but was: ' + this._obj.state,
              'expected ' + name + ' to not be active(), but was.');
});

chai.Assertion.addProperty('TERMINATED', function() {
  let name = 'worker#' + this._obj.id;
  this.assert(this._obj.state === 0,
              'expected ' + name + ' to be TERMINATED(0) but was: ' + this._obj.state,
              'expected ' + name + ' to not have been TERMINATED(0), but was.');
});

function delay(time, cb) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      try {
        resolve(cb());
      } catch(e) {
        reject(e);
      }
    }, time);
  });
}

describe('worker', function() {
  var worker;

  before(function() {
    worker = new Worker('dist/runner.js');
  });

  after(function() {
    worker.terminate();
  });

  describe('#toJSON', function() {
    it('serializes  worker', function() {
      expect(worker.toJSON()).to.deep.equal({
        id: 0,
        pending: 0,
        state: 1,
        totalTime: 0
      });
    });
  });

  describe('#run', function() {
    it('runs and fulfills with the return value', async function() {
      expect(worker).to.be.ACTIVE;

      let value = await worker.run(function() {
        return 1+1;
      });

      expect(worker).to.be.ACTIVE;
      expect(value).to.eql(2);
    });

    it('runs and rejects with the failure reason', async function() {
      expect(worker).to.be.ACTIVE;

      try {
        await worker.run(function() {
          throw new Error('OMG');
        });
        expect(true).to.be.false;
      } catch(reason) {
        expect(worker).to.be.ACTIVE;
        expect(reason.message).to.eql('OMG');
      }
    });

    it('runs and rejects with NO failure reason', async function() {
      expect(worker).to.be.ACTIVE;

      try {
        await worker.run(function() {
          return require('rsvp').Promise.reject();
        });
        expect(true).to.be.false;
      } catch(reason) {
        expect(worker).to.be.ACTIVE;
        expect(reason).to.eql(null);
      }
    });

    it('runs and rejects with the failure reason (promise)', async function() {
      expect(worker).to.be.ACTIVE;

      try {
        await worker.run(function() {
          return require('rsvp').Promise.reject('a failure');
        });

        expect(true).to.be.false;
      } catch(reason) {
        expect(worker).to.be.ACTIVE;
        expect(reason).to.eql('a failure');
      }
    });

    it('runs and rejects with the failure reason (setTimeout)', async function() {
      expect(worker).to.be.ACTIVE;

      let value = await worker.run(function() {
        setTimeout(function() {
          throw new Error('OMG');
        }, 0);
        return 'some value';
      });

      expect(value).to.be.eql('some value');
      expect(worker).to.be.ACTIVE;

      await delay(100, function() {
        expect(worker).to.be.TERMINATED;
      });
    });

    describe('pending requests, and a spurious unhandledException', function() {
      // ensure all pending requests are rejected
      // ensure worker has been terminated
    });
  });
});
