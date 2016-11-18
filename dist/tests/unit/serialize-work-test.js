'use strict';

var chai = require('chai');

function serializeWork(cb) {
  return '(' + cb.toString() + '(typeof payload === "object" && payload.arg));';
}

describe('serializeWork', function () {
  it('can be eval\'d, and returns its own result', function () {
    var work = function work() {
      return 1 + 1;
    };
    var result = work();

    chai.expect(result).to.eql(2);
    chai.expect(eval(serializeWork(work))).to.eql(result);
  });

  it('can be eval\'d, with payload.arg', function () {
    var work = function work(x) {
      return x + 1;
    };
    /* eslint-disable */
    var payload = { arg: 3 };
    /* eslint-enable */
    chai.expect(eval(serializeWork(work))).to.eql(4);
  });
});