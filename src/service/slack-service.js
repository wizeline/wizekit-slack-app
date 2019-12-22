
const { slackWebApi } = require('../config/slack-webapi');
const stringUtil = require('../util/string-util');


async function reactions(reactObj) {
  slackWebApi.reactions.add(reactObj);
}

async function notifiKudosReceiver(slackReceviers, message) {
  const notifiyUsers = slackReceviers
    .reduce((acc, receiver) => acc.concat([
      slackWebApi.chat.postMessage({
        channel: stringUtil.getUserCode(receiver),
        text: message,
        as_user: true,
        attachments: [{
          text: '<https://datastudio.google.com/u/0/reporting/c7b98aa1-1484-497e-a092-751db414da46/page/Gp06| *View dashboard*>',
        }],
      }),
    ]), []);

  Promise.all(notifiyUsers);
}

async function proccessKudo(commandBody, users) {
  notifiKudosReceiver(users, `<@${commandBody.user_id}> just gave you a kudo!`);
  // `res` contains information about the posted message
  // console.log('Message sent: ', res.ts);
  // await reactions({
  //   channel: commandBody.channel_id,
  //   name: 'clap',
  //   timestamp: res.ts,
  // });
}


module.exports = {
  reactions,
  proccessKudo,
};
