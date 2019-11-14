/**
 * Background Cloud Function to be triggered by Pub/Sub.
 * This function is exported by index.js, and executed when
 * the trigger topic receives a message.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */
module.exports.commandSub = (pubSubEvent, context) => {
  console.log('pubsubEvent:', pubSubEvent , context);
  const data = pubSubEvent.data
    ? Buffer.from(pubSubEvent.data, 'base64').toString()
    : 'Empty Body';
  console.log(`Hello, ${data}!`);
};
