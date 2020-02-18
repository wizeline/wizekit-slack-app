const { slackWebApi } = require('../config/slack-api');
const stringUtil = require('../util/string-util');

const DASHBOARD_URL = 'https://the-quizz-world.appspot.com/';

async function reactions(reactObj) {
  slackWebApi.reactions.add(reactObj);
}

async function notifiKudosReceiver(slackReceivers, message) {
  const notifiyUsers = slackReceivers
    .reduce((acc, receiver) => acc.concat([
      slackWebApi.chat.postMessage({
        channel: stringUtil.getUserCode(receiver),
        text: message,
        as_user: true,
        attachments: [{
          text: `<${DASHBOARD_URL}| *View dashboard*>`,
        }],
      }),
    ]), []);

  return Promise.all(notifiyUsers);
}

async function proccessKudo(commandBody, users = []) {
  if (!users.length) {
    return;
  }
  notifiKudosReceiver(users, `Hi, <@${commandBody.user_id}> just gave you a kudo!`);
  // console.log('Message sent: ', commandBody);
  // await reactions({
  //   channel: commandBody.channel_id,
  //   name: 'clap',
  //   timestamp: commandBody.ts,
  // });
}


module.exports = {
  reactions,
  proccessKudo,
};
