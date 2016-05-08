import '../ensure-promise';
import regeneratorRuntime from 'regenerator-runtime';

import serializeError from './serialize-error';
import sendJSON from './send-json';

export default async function(raw) {
  let id;

  try {
    let payload = JSON.parse(raw);

    if (!payload.requestId) { throw new Error('Payload requires `requestId`'); }
    if (!payload.work)      { throw new Error('Payload requires `work`'); }

    id = payload.requestId;

    let value = await Promise.resolve(eval(payload.work));

    sendJSON({
      requestId: id,
      value: value || null
    });
  } catch(reason) {

    try {
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
    } catch(error) {

      sendJSON({
        requestId: id || 'unknown',
        reason: serializeError(error) || null
      });
    }
  }
}
