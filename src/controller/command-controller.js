const commandService = require('../service/command-service');
const kudosService = require('../service/kudo-service');
const { validateMsgLength } = require('../util/validator');

async function search(req, res) {
  const {
    offset, limit, orderBy, fromDate, toDate,
  } = req.query;

  const commands = await commandService.search(
    offset,
    limit,
    orderBy,
    fromDate,
    toDate,
  );

  res.json({
    data: commands,
  });
}

async function slackCommandKudos(req, res) {
  try {
    const commandEntity = await commandService.save(req.body);
    const {
      text, user_name: userName, channel_name: channelName, user_id: userId,
    } = req.body;

    if (!validateMsgLength(text)) {
      return res.json({
        response_type: 'ephemeral',
        text: `Hi <@${userId}>, \`/kudos\` is for encouraging people, please write something thoughtful.`,
      });
    }

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
    console.error('Error:', e);
  }

  return res.json({
    response_type: 'in_channel',
  });
}

module.exports = {
  search,
  slackCommandKudos,
};
