'use strict';

var chai = require('chai');
var td = require('testdouble');
td = 'default' in td ? td['default'] : td;
var regeneratorRuntime = require('regenerator-runtime');
regeneratorRuntime = 'default' in regeneratorRuntime ? regeneratorRuntime['default'] : regeneratorRuntime;
var rsvp = require('rsvp');

global.Promise = global.Promise || rsvp.Promise;

function serializeError(error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
}

function sendJSON(obj) {
  process.send(JSON.stringify(obj));
}

function callee$0$0(raw) {
  var id, payload, value, _id, reasonValue;

  return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        id = undefined;
        context$1$0.prev = 1;
        payload = JSON.parse(raw);

        if (payload.requestId) {
          context$1$0.next = 5;
          break;
        }

        throw new Error('Payload requires `requestId`');

      case 5:
        if (payload.work) {
          context$1$0.next = 7;
          break;
        }

        throw new Error('Payload requires `work`');

      case 7:

        id = payload.requestId;

        context$1$0.next = 10;
        return regeneratorRuntime.awrap(Promise.resolve(eval(payload.work)));

      case 10:
        value = context$1$0.sent;

        sendJSON({
          requestId: id,
          value: value || null
        });
        context$1$0.next = 17;
        break;

      case 14:
        context$1$0.prev = 14;
        context$1$0.t0 = context$1$0['catch'](1);

        try {
          payload = JSON.parse(raw);
          _id = payload.requestId;
          reasonValue = undefined;

          if (typeof context$1$0.t0 === 'object') {
            reasonValue = serializeError(context$1$0.t0);
          } else {
            reasonValue = context$1$0.t0;
          }

          sendJSON({
            requestId: _id,
            reason: reasonValue || null
          });
        } catch (error) {
          sendJSON({
            requestId: id || 'unknown',
            reason: serializeError(error) || null
          });
        }

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this, [[1, 14]]);
}

/* eslint-enable */

describe('runner/handler', function () {
  var send = undefined,
      oldSend = undefined;

  before(function () {
    send = td['function']('process.send');
    oldSend = process.send;
    process.send = send;
  });

  after(function () {
    process.send = oldSend;
  });

  describe('request', function () {
    it('fails with no input', function callee$2$0() {
      var sent;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return regeneratorRuntime.awrap(callee$0$0());

          case 2:
            sent = lastArgs(send);

            chai.expect(sent.requestId).to.eql('unknown');
            chai.expect(sent.reason.name).to.eql('SyntaxError');
            chai.expect(sent.reason.stack).to.be.a.String;

          case 6:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    function lastArgs(send) {
      var calls = td.explain(send).calls;
      return JSON.parse(calls[calls.length - 1].args[0]);
    }

    it('fails with mailformed JSON', function callee$2$0() {
      var sent;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return regeneratorRuntime.awrap(callee$0$0('{{{'));

          case 2:
            sent = lastArgs(send);

            chai.expect(sent.reason.name).to.eql('SyntaxError');
            chai.expect(sent.reason.message).to.match(/Unexpected token \{/);
            chai.expect(sent.reason.stack).to.be.a.String;
            chai.expect(sent.reason.stack).to.be.a.String;

          case 7:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    it('fails with empty', function callee$2$0() {
      var sent;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return regeneratorRuntime.awrap(callee$0$0(JSON.stringify({})));

          case 2:
            sent = lastArgs(send);

            chai.expect(sent.reason.name).to.eql('Error');
            chai.expect(sent.reason.message).to.eql('Payload requires `requestId`');

          case 5:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    it('fails with no work', function callee$2$0() {
      var sent;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return regeneratorRuntime.awrap(callee$0$0(JSON.stringify({
              requestId: 1
            })));

          case 2:
            sent = lastArgs(send);

            chai.expect(sent.reason.name).to.eql('Error');
            chai.expect(sent.reason.message).to.eql('Payload requires `work`');
            chai.expect(sent.reason.stack).to.be.a.String;
            chai.expect(sent.reason.stack).to.be.a.String;

          case 7:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    it('fails with no ID', function callee$2$0() {
      var sent;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return regeneratorRuntime.awrap(callee$0$0(JSON.stringify({
              work: '1'
            })));

          case 2:
            sent = lastArgs(send);

            chai.expect(sent.reason.name).to.eql('Error');
            chai.expect(sent.reason.message).to.eql('Payload requires `requestId`');
            chai.expect(sent.reason.stack).to.be.a.String;
            chai.expect(sent.reason.stack).to.be.a.String;

          case 7:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });

    it('fails with invalid work, and no id', function callee$2$0() {
      var sent;
      return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
        while (1) switch (context$3$0.prev = context$3$0.next) {
          case 0:
            context$3$0.next = 2;
            return regeneratorRuntime.awrap(callee$0$0(JSON.stringify({
              work: '#^##asdf$##'
            })));

          case 2:
            sent = lastArgs(send);

            chai.expect(sent.reason.name).to.eql('Error');
            chai.expect(sent.reason.message).to.eql('Payload requires `requestId`');
            chai.expect(sent.reason.stack).to.be.a.String;
            chai.expect(sent.reason.stack).to.be.a.String;

          case 7:
          case 'end':
            return context$3$0.stop();
        }
      }, null, this);
    });
  });

  describe('work', function () {
    function requestedWork(work) {
      return callee$0$0(JSON.stringify({
        requestId: 1,
        work: work
      }));
    }

    function responseValue(expected) {
      return function () {
        var calls = td.explain(send).calls;
        var actual = JSON.parse(calls[calls.length - 1].args[0]).value;

        chai.expect(actual).to.deep.eql(expected);
      };
    }

    function responseReason(fn) {
      return function () {
        var calls = td.explain(send).calls;
        var actual = JSON.parse(calls[calls.length - 1].args[0]).reason;

        fn(actual);
      };
    }

    it('works with basic value', function () {
      return requestedWork('3').then(responseValue(3));
    });

    it('works with basic computation', function () {
      return requestedWork('1+1').then(responseValue(2));
    });

    it('works with advanced computation', function () {
      return requestedWork('function foo() { return 1; }; foo();').then(responseValue(1));
    });

    it('works with undefined', function () {
      return requestedWork('null').then(responseValue(null));
    });

    it('works with null', function () {
      return requestedWork('undefined').then(responseValue(null));
    });

    it('works with promise', function () {
      return requestedWork('var Promise = require(\'rsvp\').Promise; Promise.resolve(6);').then(responseValue(6));
    });

    it('rejects if work has a syntax failure', function () {
      return requestedWork('##syntax error##').then(responseReason(function (reason) {
        chai.expect(reason.message).to.be.eql('Unexpected token ILLEGAL');
        chai.expect(reason.name).to.be.eql('SyntaxError');
      }));
    });

    it('rejects if work has a syntax failure in a promise', function () {
      return requestedWork('var Promise = require(\'rsvp\').Promise; Promise.resolve().then(function() { ## syntax error ## });').then(responseReason(function (reason) {
        chai.expect(reason.message).to.be.eql('Unexpected token ILLEGAL');
        chai.expect(reason.name).to.be.eql('SyntaxError');
      }));
    });

    it('rejects if the promise rejects', function () {
      return requestedWork('var Promise = require(\'rsvp\').Promise; Promise.reject(\'somereason\');').then(responseReason(function (reason) {
        chai.expect(reason).to.be.eql('somereason');
      }));
    });
  });
});