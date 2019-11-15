const commandService = require('../service/command-service');
const kudoService = require('../service/kudo-service');
const { datastore } = require('../config/datastore');
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
    const notProcessedEntities = await commandService.findByIds(
      [commandEntity.key.id]
    );
    if (notProcessedEntities && notProcessedEntities[0] && notProcessedEntities[0].processed ) {
      console.log('Command id : ' + commandEntity.key.id + ' was proccessed.');
      return;
    }
    const notProcessedEntity = notProcessedEntities[0];
    const { text, user_name } = notProcessedEntity;
    const users = getUserList(text, user_name);
    const kudoList = createKudoList(users, notProcessedEntity);
    await kudoService.save(kudoList);
    await commandService.edit(commandEntity[datastore.KEY].id, {
      ...notProcessedEntity,
      processed: true,
    });
  } catch (e) {
    console.error(
      'Error message: ' + e.message,
      'eventDataString: ',
      eventDataStr,
      e,
    );
  }
};

function createKudoList(users, commandEntity) {
  const { user_name, createdAt } = commandEntity;
  const { id } = commandEntity[datastore.KEY];
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
