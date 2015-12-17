import serializeError from './serialize-error';
import sendJSON from './send-json';
import { Promise } from 'rsvp';

export default function(raw) {
  let id;

  return new Promise(resolve => {
    let payload = JSON.parse(raw);

    if (!payload.requestId) { throw new Error('Payload requires `requestId`'); }
    if (!payload.work)      { throw new Error('Payload requires `work`'); }

    id = payload.requestId;

    resolve(eval(payload.work));
  }).then(value =>{
    sendJSON({
      requestId: id,
      value: value || null
    });
  }).catch(reason => {
    let payload = JSON.parse(raw);
    let id = payload.requestId;

    let reasonValue;
    if (typeof reason === 'object') {
      reasonValue = serializeError(reason);
    } else {
      reasonValue = reason;
    }

    sendJSON({
      requestId: id,
      reason: reasonValue || null
    });
  }).catch(reason => {
    sendJSON({
      requestId: id || 'unknown',
      reason: serializeError(reason) || null
    });
  });
}
