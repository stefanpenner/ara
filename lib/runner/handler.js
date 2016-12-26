import '../ensure-promise';
import Message from '../models/message';
/* eslint-disable */
import regeneratorRuntime from 'regenerator-runtime';
/* eslint-enable */

import serializeError from '../utils/serialize-error';

export default async function(raw) {
  let id;

  try {
    let payload = raw;

    if (!payload.requestId) { throw new Error('Payload requires `requestId`'); }
    if (!payload.work)      { throw new Error('Payload requires `work`'); }

    id = payload.requestId;

    let message = payload.work;
    let ActorType = require(message.meta.actorPath);
    let actorInstance = new ActorType(message.meta.constructorProperties);
    let value = await Promise.resolve(
      actorInstance.receive(message.properties.value)
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
