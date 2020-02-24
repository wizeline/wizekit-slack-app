const commandService = require('../service/command-service');
const kudosService = require('../service/kudo-service');
const userService = require('../service/user-service');
const slackService = require('../service/slack-service');

async function commandKudos(req, res) {
  console.log(__filename, req.body);
  const {
    text, user_name: userName, channel_name: channelName, user_id: userId,
  } = req.body;
  try {
    if (!text || !userName) {
      return res.json({
        response_type: 'in_channel',
      });
    }

    const commandEntity = await commandService.save(req.body);
    if (channelName === 'directmessage') {
      return res.json({
        response_type: 'in_channel',
        text: `Hi <@${userId}>, \`/kudos\` doesn't work on Direct Message or Private Channel`,
      });
    }

    const slackUsers = userService.extractUserList(text, userName);
    const usernameList = userService.getUserNameList(slackUsers);

    if (usernameList.length !== slackUsers.length) {
      console.warn(__filename, 'Please turn "Escape channels, users, and links sent to your app" ON.');
    }

    const kudoList = kudosService.createKudoList(usernameList, commandEntity);
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
