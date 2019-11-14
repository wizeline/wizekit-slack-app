const userService = require('../service/command-service');
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */
module.exports.commandSub = async function fn(pubSubEvent, context) {
  try {
    const commandEntity = pubSubEvent.data
      ? JSON.stringify(Buffer.from(pubSubEvent.data, 'base64').toString())
      : null;
    await userService(commandEntity.key, {
      ...commandEntity.data,
      processed: true,
    });
  } catch (e) {
    console.error(e);
  }
};
