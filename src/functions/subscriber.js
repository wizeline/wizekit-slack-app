const commandService = require('../service/command-service');
const kudoService = require('../service/kudo-service');
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
    const { text, user_name } = commandEntity.data;
    const users = getUserList(text, user_name);
    const kudoList = createKudoList(users, commandEntity);
    await kudoService.save(kudoList);
    await commandService.edit(commandEntity.key.id, {
      ...commandEntity.data,
      processed: true,
    });
  } catch (e) {
    console.error(e);
  }
};

function createKudoList(users, commandEntity) {
  const { user_name, createdDate } = commandEntity.data;
  const { id } = commandEntity.key;
  return users.map(u => ({
    giver: user_name,
    receiver: u,
    commandId: id,
    commandCreatedDate: createdDate,
  }));
}

function getUserList(text, currentUser) {
  const matches = text.match(/<@\S+>/gm);
  const slackAccounts =
    matches && matches.length ? Array.from(new Set(matches)) : [];
  return slackAccounts
    .map(ac => {
      let user = ac.match(/^<\S+\|(.+)>$/i)[1];
      user = user ? user : ac.match(/@\S+/i)[1];
    })
    .filter(ac => ac && ac !== currentUser);
}
