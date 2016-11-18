import System from '../../lib/system';
import chai from 'chai';
// import { Promise } from 'rsvp';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

const { expect } = chai;

describe('actor', function() {
  var actor, system;

  before(() => {
    system = new System();
    actor = system.actorOf();
  })

  it('has a unique id', function() {
    expect(actor.id).to.exist;
  });

  it('has a parent', function() {
    expect(actor.parent).to.exist;
    expect(actor.parent).to.deep.equal(system);
  });
});
