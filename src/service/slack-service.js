const slackWebApi = require('../config/slack-api');
const stringUtil = require('../util/string-util');

const DASHBOARD_URL = 'https://the-quizz-world.appspot.com/';

async function reactions(reactObj) {
  slackWebApi.reactions.add(reactObj);
}

async function notifyKudosReceiver(slackReceivers, message) {
  const notifyUsers = slackReceivers.reduce(
    (acc, receiver) => acc.concat([
      slackWebApi.chat.postMessage({
        channel: stringUtil.getUserCode(receiver),
        text: message,
        as_user: true,
        attachments: [
          {
            text: `<${DASHBOARD_URL}| *View dashboard*>`,
          },
        ],
      }),
    ]),
    [],
  );

  return Promise.all(notifyUsers);
}

async function processKudoMessage(commandBody, users = []) {
  if (!users.length) {
    return;
  }
  notifyKudosReceiver(
    users,
    `Hi, <@${commandBody.user_id}> just gave you a kudo!`,
  );
}

module.exports = {
  reactions,
  processKudoMessage,
};
