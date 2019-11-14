const commandService = require('../service/command-service');
const kudoService = require('../service/kudo-service');
//TODO: Fix the possible duplicated message. https://cloud.google.com/pubsub/docs/faq
/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} pubSubEvent The event payload.
 * @param {object} context The event metadata.
 */
module.exports.commandSub = async function fn(pubSubEvent, context) {
  const eventDataStr = pubSubEvent.data
      ? Buffer.from(pubSubEvent.data, 'base64').toString()
      : null;
  try {
    const commandEntity = JSON.parse(eventDataStr);
    const notProcessedEntity = await commandService.findNotProcessed(commandEntity.key.id);
    if(!notProcessedEntity){
      return;
    }
    const { text, user_name } = notProcessedEntity.data;
    const users = getUserList(text, user_name);
    const kudoList = createKudoList(users, notProcessedEntity);
    await kudoService.save(kudoList);
    await commandService.edit(notProcessedEntity.key.id, {
      ...notProcessedEntity.data,
      processed: true,
    });
  } catch (e) {
    console.error('Error message: ' + e.message , 'eventDataString: ', eventDataStr, e);
  }
};

function createKudoList(users, commandEntity) {
  const { user_name, createdAt } = commandEntity.data;
  const { id } = commandEntity.key;
  return users.map(u => ({
    giver: user_name,
    receiver: u,
    commandId: id,
    commandCreatedDate: createdAt,
  }));
}

function getUserList(text, currentUser) {
  const matches = text.match(/<@\S+>/gm);
  const slackAccounts =
    matches && matches.length ? Array.from(new Set(matches)) : [];
  return slackAccounts
    .map(ac => {
      const user = ac.match(/^<\S+\|(.+)>$/i)[1];
      return user ? user : ac.match(/@\S+/i)[1];
    })
    .filter(ac => ac && ac !== currentUser);
}
