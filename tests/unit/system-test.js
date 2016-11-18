import System from '../../lib/system';
import chai from 'chai';
// import { Promise } from 'rsvp';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

const { expect } = chai;

describe('system', function() {
  var system;

  before(() => {
    system = new System();
  })

  it('has a process pool', function() {
    expect(system.processPool).to.exist;
  });
});
