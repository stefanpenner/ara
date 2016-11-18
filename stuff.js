'use strict';

var Ara = require('./dist/ara');

var System = Ara.System;
var Actor = Ara.Actor;

var BabelActor = Actor.extend({
  // init: function() {
  //   this._super.apply(this, arguments);
  // },

  receive: function(value) {
    var result = require('babel-core').transform(value);
    console.log(result);

    return {
      code: result.code,
      map: result.map
    };
  }
});

var system = new System();
var babelActor = system.actorOf(BabelActor);
babelActor.send('1+1').then(function(result) {
  console.log(code, result.code);
  console.log(code, result.map);
});
