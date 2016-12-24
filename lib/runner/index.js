import sendJSON from './send-json';
// import serializeError from './serialize-error';
import handler from './handler';

process.on('message', handler);
process.on('uncaughtException', exception => {
  sendJSON({
    id: 'unknown',
    reason: exception
    // reason: serializeError(exception)
  });
});
