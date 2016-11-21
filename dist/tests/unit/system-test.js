'use strict';

var chai = require('chai');
chai = 'default' in chai ? chai['default'] : chai;
var regeneratorRuntime = require('regenerator-runtime');
regeneratorRuntime = 'default' in regeneratorRuntime ? regeneratorRuntime['default'] : regeneratorRuntime;
var _debug = require('debug');
_debug = 'default' in _debug ? _debug['default'] : _debug;
var CoreObject = require('core-object');
CoreObject = 'default' in CoreObject ? CoreObject['default'] : CoreObject;
var uuid = require('node-uuid');
uuid = 'default' in uuid ? uuid['default'] : uuid;
var ps = require('child_process');
ps = 'default' in ps ? ps['default'] : ps;
var rsvp = require('rsvp');

var babelHelpers = {};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

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

babelHelpers.get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
var debug$1 = _debug('actor');

var Actor = (function (_CoreObject) {
  babelHelpers.inherits(Actor, _CoreObject);

  function Actor() {
    babelHelpers.classCallCheck(this, Actor);
    babelHelpers.get(Object.getPrototypeOf(Actor.prototype), 'constructor', this).apply(this, arguments);
  }

  babelHelpers.createClass(Actor, [{
    key: 'init',
    value: function init(system) {
      debug$1('create');
      if (!system) {
        throw new Error('Creating actor using `new` is not allowed.');
      }

      this.parent = system;
      this.id = uuid.v4();
    }
  }, {
    key: 'send',
    value: function send(message) {
      var receive;
      return regeneratorRuntime.async(function send$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            receive = this.receive;
            return context$2$0.abrupt('return', this.parent.schedule({ message: message, receive: receive }));

          case 2:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);
  return Actor;
})(CoreObject);

function serializeWork(cb) {
  return '(' + cb.toString() + '(typeof payload === "object" && payload.arg));';
}

var debug$2 = _debug('ara:worker');

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
        debug$2('Unknown request, something went wrong. payload: %s', msg);
        debug$2('unknown request, terminating worker#%d', worker.id);
        // TODO: ... ?
        _this.terminate(); // is this needed?
        return;
      }

      delete _this.requests[data.requestId];

      var took = Date.now() - request.start;

      _this.totalTime += took;

      debug$2('worker: %d, job: %d, took: %dms', _this.id, data.requestId, took);
      debug$2('worker: %d, job: %d, payload: %o', _this.id, data.requestId, data);

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

        debug$2('worker.process.send %o', {
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

Math.max(1, require('os').cpus().length - 1);

global.Promise = global.Promise || rsvp.Promise;

/* eslint-enable */

// TODO: this file is just a brainstorm sketch, it actually needs to be
// implemented.

var Pool = (function () {
  function Pool(options) {
    babelHelpers.classCallCheck(this, Pool);

    // this.j = options && options.j || maxCPU;
    this.workers = [];
    this.idle = [];
    this.pendingWork = [];
  }

  babelHelpers.createClass(Pool, [{
    key: 'popIdleWorker',
    value: function popIdleWorker() {
      // return this.workers.pop();
      return new Worker(__dirname + '/runner.js');
    }
  }, {
    key: 'run',
    value: function run(_ref) {
      var value = _ref.value;
      var receive = _ref.receive;

      var worker, _value;

      return regeneratorRuntime.async(function run$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return regeneratorRuntime.awrap(this.popIdleWorker());

          case 2:
            worker = context$2$0.sent;
            context$2$0.prev = 3;
            context$2$0.next = 6;
            return regeneratorRuntime.awrap(worker.run(receive, _value));

          case 6:
            _value = context$2$0.sent;

            this._becameIdle(worker);
            return context$2$0.abrupt('return', _value);

          case 11:
            context$2$0.prev = 11;
            context$2$0.t0 = context$2$0['catch'](3);

            this._crashed(worker, context$2$0.t0);
            throw context$2$0.t0;

          case 15:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[3, 11]]);
    }
  }, {
    key: '_becameIdle',
    value: function _becameIdle(worker) {
      this.idle.push(worker); // ensure unique, maybe use fast-ordered-set
    }
  }, {
    key: '_crashed',
    value: function _crashed(worker) {
      // remove from workers
      worker.terminate(); // ensure its dead
    }
  }]);
  return Pool;
})();

/* eslint-enable */

var debug = _debug('ara:system');

var System = (function () {
  function System() {
    babelHelpers.classCallCheck(this, System);

    this.processPool = new Pool();
  }

  babelHelpers.createClass(System, [{
    key: 'schedule',
    value: function schedule() {
      var _processPool;

      var args$2$0 = arguments;
      return regeneratorRuntime.async(function schedule$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            debug('system.schedule');
            return context$2$0.abrupt('return', (_processPool = this.processPool).run.apply(_processPool, args$2$0));

          case 2:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: 'actorOf',
    value: function actorOf() {
      var Type = arguments.length <= 0 || arguments[0] === undefined ? Actor : arguments[0];

      return new Type(this);
    }
  }]);
  return System;
})();

/* eslint-enable */

var expect = chai.expect;

describe('system', function () {
  var system;

  before(function () {
    system = new System();
  });

  it('has a process pool', function () {
    expect(system.processPool).to.exist;
  });
});