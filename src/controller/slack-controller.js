const commandService = require('../service/command-service');
const kudosService = require('../service/kudo-service');

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

    const users = kudosService.getUserList(text, userName);
    const kudoList = kudosService.createKudoList(users, commandEntity);
    kudosService.save(kudoList);
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
