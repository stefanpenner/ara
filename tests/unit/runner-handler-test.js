import handler from '../../lib/runner/handler';
import { expect } from 'chai';
import td from 'testdouble';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

describe('runner/handler', () => {
  let send, oldSend;

  before(() => {
    send = td.function('process.send');
    oldSend = process.send;
    process.send = send;
  });

  after(() => {
    process.send = oldSend;
  });

  describe('request', function() {
    it('fails with no input', async function() {
      await handler();

      let sent = lastArgs(send);

      expect(sent.requestId).to.eql('unknown');
      expect(sent.reason.name).to.eql('SyntaxError');
      expect(sent.reason.stack).to.be.a.String;
    });

    function lastArgs(send) {
      let calls = td.explain(send).calls;
      return JSON.parse(calls[calls.length - 1].args[0]);
    }

    it('fails with mailformed JSON', async function() {
      await handler('{{{');

      let sent = lastArgs(send);

      expect(sent.reason.name).to.eql('SyntaxError');
      expect(sent.reason.message).to.match(/Unexpected token \{/);
      expect(sent.reason.stack).to.be.a.String;
      expect(sent.reason.stack).to.be.a.String;
    });

    it('fails with empty', async function() {
      await handler(JSON.stringify({}));

      let sent = lastArgs(send);

      expect(sent.reason.name).to.eql('Error');
      expect(sent.reason.message).to.eql('Payload requires `requestId`');
    });

    it('fails with no work', async function() {
      await handler(JSON.stringify({
        requestId: 1
      }));

      let sent = lastArgs(send);

      expect(sent.reason.name).to.eql('Error');
      expect(sent.reason.message).to.eql('Payload requires `work`');
      expect(sent.reason.stack).to.be.a.String;
      expect(sent.reason.stack).to.be.a.String;
    });

    it('fails with no ID', async function() {
      await handler(JSON.stringify({
        work: '1'
      }));

      let sent = lastArgs(send);

      expect(sent.reason.name).to.eql('Error');
      expect(sent.reason.message).to.eql('Payload requires `requestId`');
      expect(sent.reason.stack).to.be.a.String;
      expect(sent.reason.stack).to.be.a.String;
    });

    it('fails with invalid work, and no id', async function() {
      await  handler(JSON.stringify({
        work: '#^##asdf$##'
      }));

      let sent = lastArgs(send);

      expect(sent.reason.name).to.eql('Error');
      expect(sent.reason.message).to.eql('Payload requires `requestId`');
      expect(sent.reason.stack).to.be.a.String;
      expect(sent.reason.stack).to.be.a.String;
    });
  });

  describe('work', function() {
    function requestedWork(work) {
      return handler(JSON.stringify({
        requestId: 1,
        work: work
      }));
    }

    function responseValue(expected) {
      return function() {
        let calls = td.explain(send).calls;
        let actual = JSON.parse(calls[calls.length - 1].args[0]).value;

        expect(actual).to.deep.eql(expected);
      };
    }

    function responseReason(fn) {
      return function() {
        let calls = td.explain(send).calls;
        let actual = JSON.parse(calls[calls.length - 1].args[0]).reason;

        fn(actual);
      };
    }

    it('works with basic value', function() {
      return requestedWork('3').then(responseValue(3));
    });

    it('works with basic computation', function() {
      return requestedWork('1+1').then(responseValue(2));
    });

    it('works with advanced computation', function() {
      return requestedWork('function foo() { return 1; }; foo();').then(responseValue(1));
    });

    it('works with undefined', function() {
      return requestedWork('null').then(responseValue(null));
    });

    it('works with null', function() {
      return requestedWork('undefined').then(responseValue(null));
    });

    it('works with promise', function() {
      return requestedWork('var Promise = require(\'rsvp\').Promise; Promise.resolve(6);').
        then(responseValue(6));
    });

    it('rejects if work has a syntax failure', function() {
      return requestedWork('##syntax error##').
        then(responseReason(function(reason) {
          expect(reason.message).to.be.eql('Unexpected token ILLEGAL');
          expect(reason.name).to.be.eql('SyntaxError');
        }));
    });

    it('rejects if work has a syntax failure in a promise', function() {
      return requestedWork('var Promise = require(\'rsvp\').Promise; Promise.resolve().then(function() { ## syntax error ## });').
        then(responseReason(function(reason) {
          expect(reason.message).to.be.eql('Unexpected token ILLEGAL');
          expect(reason.name).to.be.eql('SyntaxError');
        }));
    });

    it('rejects if the promise rejects', function() {
      return requestedWork('var Promise = require(\'rsvp\').Promise; Promise.reject(\'somereason\');').
        then(responseReason(function(reason) {
          expect(reason).to.be.eql('somereason');
        }));
    });
  });
});
