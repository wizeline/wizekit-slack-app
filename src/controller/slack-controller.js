const commandService = require('../service/command-service');
const kudosService = require('../service/kudo-service');
const slackService = require('../service/slack-service');
const stringUtil = require('../util/string-util');

async function commandKudos(req, res) {
  try {
    const commandEntity = await commandService.save(req.body);
    const {
      text, user_name: userName, channel_name: channelName, user_id: userId,
    } = req.body;

    if (channelName === 'directmessage') {
      return res.json({
        response_type: 'in_channel',
        text: `Hi <@${userId}>, \`/kudos\` doesn't work on Direct Message or Private Channel`,
      });
    }

    const slackUsers = kudosService.getUserList(text, userName);
    const users = slackUsers.reduce((list, slackUser) => {
      const username = stringUtil.getUserName(slackUser);
      if (username) {
        list.push(username);
      }
      return list;
    }, []);

    if (users.length !== slackUsers.length) {
      console.warn('Please turn "Escape channels, users, and links sent to your app" ON.');
    }
    const kudoList = kudosService.createKudoList(users, commandEntity);
    kudosService.save(kudoList);
    slackService.proccessKudo(req.body, slackUsers);
  } catch (e) {
    console.error(__filename, e);
  }

  return res.json({
    response_type: 'in_channel',
  });
}

module.exports = {
  commandKudos,
};
