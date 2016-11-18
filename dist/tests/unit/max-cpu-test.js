'use strict';

var chai = require('chai');

var maxCPU = Math.max(1, require('os').cpus().length - 1);

describe('maxCPU', function () {
  it('is as expected', function () {
    chai.expect(maxCPU).to.be.a.Number;
    chai.expect(maxCPU).to.be.gt(0);
    chai.expect(maxCPU).to.not.be.NaN;
  });
});