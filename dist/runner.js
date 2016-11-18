'use strict';

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

process.on('message', callee$0$0);
process.on('uncaughtException', function (exception) {
  sendJSON({
    id: 'unknown',
    reason: serializeError(exception)
  });
});