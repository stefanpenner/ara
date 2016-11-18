'use strict';

var chai = require('chai');
chai = 'default' in chai ? chai['default'] : chai;
var rsvp = require('rsvp');
var regeneratorRuntime = require('regenerator-runtime');
regeneratorRuntime = 'default' in regeneratorRuntime ? regeneratorRuntime['default'] : regeneratorRuntime;
var ps = require('child_process');
ps = 'default' in ps ? ps['default'] : ps;
var _debug = require('debug');
_debug = 'default' in _debug ? _debug['default'] : _debug;

var babelHelpers = {};

babelHelpers.createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
function serializeWork(cb) {
  return '(' + cb.toString() + '(typeof payload === "object" && payload.arg));';
}

var debug = _debug('ara:worker');

var id = 0;
var TERMINATED = 0;
var RUNNING = 1;

var Worker = (function () {
  function Worker(url) {
    var _this = this;

    babelHelpers.classCallCheck(this, Worker);

    this.requests = {};
    this.requestId = 1;
    this.id = id++;
    this.totalTime = 0;

    var execArgv = process.execArgv.slice();

    if (execArgv.indexOf('--debug-brk') > -1) {
      this.debugPort = process.debugPort + this.id + 1;
      execArgv.push('--debug=' + this.debugPort);
    }

    var worker = this;

    // TODO: merge with existing process.execArgv;
    // TODO: make this ergonomic
    // TODO: make it optionally same process
    // let execArgv =  []; // fs.fork(url, { execArgv: ... });
    this.process = ps.fork(url, { execArgv: execArgv });
    this.state = RUNNING;

    // TODO: extract handler for improved unit testing
    this.process.on('message', function (msg) {
      var data = JSON.parse(msg);
      var request = worker.requests[data.requestId];

      if (request === undefined) {
        debug('Unknown request, something went wrong. payload: %s', msg);
        debug('unknown request, terminating worker#%d', worker.id);
        // TODO: ... ?
        _this.terminate(); // is this needed?
        return;
      }

      delete _this.requests[data.requestId];

      var took = Date.now() - request.start;

      _this.totalTime += took;

      debug('worker: %d, job: %d, took: %dms', _this.id, data.requestId, took);
      debug('worker: %d, job: %d, payload: %o', _this.id, data.requestId, data);

      if ('value' in data) {
        return request.resolve(data.value);
      } else if ('reason' in data) {
        return request.reject(data.reason);
      } else {
        throw new Error('message had neither, value or reason: ' + JSON.stringify(data));
      }
    });
  }

  babelHelpers.createClass(Worker, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        id: this.id,
        state: this.state,
        totalTime: this.totalTime,
        pending: Object.keys(this.requests).length
      };
    }
  }, {
    key: 'run',
    value: function run(work, arg) {
      var _this2 = this;

      return new rsvp.Promise(function (resolve, reject) {
        var id = _this2.requestId++;

        _this2.requests[id] = {
          resolve: resolve,
          reject: reject,
          start: Date.now()
        };

        debug('worker.process.send %o', {
          requestId: id,
          workerId: _this2.id
        });

        _this2.process.send(JSON.stringify({
          requestId: id,
          work: serializeWork(work),
          arg: arg
        })); // TODO: callback?
      });
    }
  }, {
    key: 'terminate',
    value: function terminate() {
      this.state = TERMINATED;
      // is this async? should we confirm?
      this.process.kill();
    }
  }]);
  return Worker;
})();

/* eslint-enable */

var expect = chai.expect;

chai.Assertion.addProperty('ACTIVE', function () {
  var name = 'worker#' + this._obj.id;

  this.assert(this._obj.state === 1, 'expected ' + name + ' to be active(1), but was: ' + this._obj.state, 'expected ' + name + ' to not be active(), but was.');
});

chai.Assertion.addProperty('TERMINATED', function () {
  var name = 'worker#' + this._obj.id;
  this.assert(this._obj.state === 0, 'expected ' + name + ' to be TERMINATED(0) but was: ' + this._obj.state, 'expected ' + name + ' to not have been TERMINATED(0), but was.');
});

function delay(time, cb) {
  return new rsvp.Promise(function (resolve, reject) {
    setTimeout(function () {
      try {
        resolve(cb());
      } catch (e) {
        reject(e);
      }
    }, time);
  });
}

describe('worker', function () {
  var worker;

  before(function () {
    worker = new Worker('dist/runner.js');
  });

  after(function () {
    worker.terminate();
  });

  describe('#toJSON', function () {
    it('serializes  worker', function () {
      expect(worker.toJSON()).to.deep.equal({
        id: 0,
        pending: 0,
        state: 1,
        totalTime: 0
      });
    });
  });

  describe('#run', function () {
    it('runs and fulfills with the return value', function callee$2$0() {
      var value;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            expect(worker).to.be.ACTIVE;

            context$3$0.next = 3;
            return regeneratorRuntime.awrap(worker.run(function () {
              return 1 + 1;
            }));

          case 3:
            value = context$3$0.sent;

            expect(worker).to.be.ACTIVE;
            expect(value).to.eql(2);

          case 6:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    it('runs and rejects with the failure reason', function callee$2$0() {
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            expect(worker).to.be.ACTIVE;

            context$3$0.prev = 1;
            context$3$0.next = 4;
            return regeneratorRuntime.awrap(worker.run(function () {
              throw new Error('OMG');
            }));

          case 4:
            expect(true).to.be['false'];
            context$3$0.next = 11;
            break;

          case 7:
            context$3$0.prev = 7;
            context$3$0.t0 = context$3$0['catch'](1);

            expect(worker).to.be.ACTIVE;
            expect(context$3$0.t0.message).to.eql('OMG');

          case 11:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this, [[1, 7]]);
    });

    it('runs and rejects with NO failure reason', function callee$2$0() {
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            expect(worker).to.be.ACTIVE;

            context$3$0.prev = 1;
            context$3$0.next = 4;
            return regeneratorRuntime.awrap(worker.run(function () {
              return require('rsvp').Promise.reject();
            }));

          case 4:
            expect(true).to.be['false'];
            context$3$0.next = 11;
            break;

          case 7:
            context$3$0.prev = 7;
            context$3$0.t0 = context$3$0['catch'](1);

            expect(worker).to.be.ACTIVE;
            expect(context$3$0.t0).to.eql(null);

          case 11:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this, [[1, 7]]);
    });

    it('runs and rejects with the failure reason (promise)', function callee$2$0() {
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            expect(worker).to.be.ACTIVE;

            context$3$0.prev = 1;
            context$3$0.next = 4;
            return regeneratorRuntime.awrap(worker.run(function () {
              return require('rsvp').Promise.reject('a failure');
            }));

          case 4:

            expect(true).to.be['false'];
            context$3$0.next = 11;
            break;

          case 7:
            context$3$0.prev = 7;
            context$3$0.t0 = context$3$0['catch'](1);

            expect(worker).to.be.ACTIVE;
            expect(context$3$0.t0).to.eql('a failure');

          case 11:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this, [[1, 7]]);
    });

    it('runs and rejects with the failure reason (setTimeout)', function callee$2$0() {
      var value;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            expect(worker).to.be.ACTIVE;

            context$3$0.next = 3;
            return regeneratorRuntime.awrap(worker.run(function () {
              setTimeout(function () {
                throw new Error('OMG');
              }, 0);
              return 'some value';
            }));

          case 3:
            value = context$3$0.sent;

            expect(value).to.be.eql('some value');
            expect(worker).to.be.ACTIVE;

            context$3$0.next = 8;
            return regeneratorRuntime.awrap(delay(100, function () {
              expect(worker).to.be.TERMINATED;
            }));

          case 8:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    describe('pending requests, and a spurious unhandledException', function () {
      // ensure all pending requests are rejected
      // ensure worker has been terminated
    });
  });
});