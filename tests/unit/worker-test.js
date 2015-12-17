import Worker from '../../lib/worker';
import chai from 'chai';
import { Promise } from 'rsvp';

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
    it('runs and fulfills with the return value', function() {
      expect(worker).to.be.ACTIVE;

      return worker.run(function() {
        return 1+1;
      }).then(function(value) {
        expect(worker).to.be.ACTIVE;
        expect(value).to.eql(2);
      });
    });

    it('runs and rejects with the failure reason', function() {
      expect(worker).to.be.ACTIVE;

      return worker.run(function() {
        throw new Error('OMG');
      }).then(function() {
        expect(true).to.be.false;
      }, function(reason) {
        expect(worker).to.be.ACTIVE;
        expect(reason.message).to.eql('OMG');
      });
    });

    it('runs and rejects with NO failure reason', function() {
      expect(worker).to.be.ACTIVE;

      return worker.run(function() {
        return require('rsvp').Promise.reject();
      }).then(function() {
        expect(true).to.be.false;
      }, function(reason) {
        expect(worker).to.be.ACTIVE;
        expect(reason).to.eql(null);
      });
    });

    it('runs and rejects with the failure reason (promise)', function() {
      expect(worker).to.be.ACTIVE;

      return worker.run(function() {
        return require('rsvp').Promise.reject('a failure');
      }).then(function() {
        expect(true).to.be.false;
      }, function(reason) {
        expect(worker).to.be.ACTIVE;
        expect(reason).to.eql('a failure');
      });
    });

    it('runs and rejects with the failure reason (setTimeout)', function() {
      expect(worker).to.be.ACTIVE;

      return worker.run(function() {
        setTimeout(function() {
          throw new Error('OMG');
        }, 0);
        return 'some value';
      }).then(function(value) {
        expect(value).to.be.eql('some value');
        expect(worker).to.be.ACTIVE;
        return delay(100, function() {
          expect(worker).to.be.TERMINATED;
        });
      });
    });
  });
});
