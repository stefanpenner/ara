'use strict';

var Ara = require('./dist/ara');

var System = Ara.System;
var Actor = Ara.Actor;

var BabelActor = Actor.extend({
  receive: function(value) {
    var result = require('babel-core').transform(value);

    return {
      code: result.code,
      map: result.map
    };
  }
});

var system = new System();
var babelActor = system.actorOf(BabelActor);
babelActor.ask('1+1').then(function(result) {
  console.log(code, result.code);
  console.log(code, result.map);
});
