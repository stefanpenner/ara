import EchoActor from './test-actors/echo-actor';
import System from '../../lib/system';
import chai from 'chai';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

const { expect } = chai;

describe('system', function() {
  var system;

  before(() => {
    system = new System();
  })

  it('has a scheduler', () => {
    expect(system.scheduler).to.exist;
  });

  it('`actorOf` should return an instance of an actor given an actor path', () => {
    let actor = system.actorOf('./test-actors/echo-actor');

    expect(actor instanceof EchoActor).to.be.true;
  });

  it('`actorOf throws an error if actor path is not specified`', function() {
    expect(() => {
      system.actorOf();
    }).to.throw(/You must specify a path to an actor/);
  });
});
