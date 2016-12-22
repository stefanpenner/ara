import '../ensure-promise';
import Message from '../message';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

import serializeError from './serialize-error';
import sendJSON from './send-json';

export default async function(raw) {
  let id;

  try {
    let payload = raw;

    if (!payload.requestId) { throw new Error('Payload requires `requestId`'); }
    if (!payload.work)      { throw new Error('Payload requires `work`'); }

    id = payload.requestId;

    let ActorType = require(payload.work.actorPath);
    let actorInstance = new ActorType();
    let message = new Message({
      value: payload.work.value
    });
    let value = await Promise.resolve(
      actorInstance.receive(message)
    );

    process.send({
      requestId: id,
      value: value || null
    });
  } catch(reason) {
    try {
      let payload = raw;
      let id = payload.requestId;

      let reasonValue;
      if (typeof reason === 'object') {
        reasonValue = serializeError(reason);
      } else {
        reasonValue = reason;
      }

      process.send({
        requestId: id,
        reason: reasonValue || null
      });
    } catch(error) {
      process.send({
        requestId: id,
        reason: error || null
      });
    }
  }
}
