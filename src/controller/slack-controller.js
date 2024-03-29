const commandService = require('../service/command-service');
const kudosService = require('../service/kudo-service');
const userService = require('../service/user-service');
const slackService = require('../service/slack-service');
const pollService = require('../service/poll-service');
const pollUtil = require('../util/poll-util');

async function commandKudos(req, res) {
  console.log(__filename, req.body);
  const {
    text,
    user_name: userName,
    channel_name: channelName,
    user_id: userId,
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
      console.warn(
        __filename,
        'Please turn "Escape channels, users, and links sent to your app" ON.',
      );
    }

    const kudoList = kudosService.createKudoList(usernameList, commandEntity);
    kudosService.save(kudoList);
    slackService.processKudoMessage(req.body, slackUsers);
  } catch (e) {
    console.error(__filename, e);
  }

  return res.json({
    response_type: 'in_channel',
  });
}

async function wizePoll(req, res) {
  console.log(__filename, 'wizePoll', req.body);
  const {
    text,
    user_name: userName,
    user_id: userId,
    command,
  } = req.body;
  try {
    const isHelpMessage = text && text.trim().toLowerCase() === 'help';
    if ((!text || !userName) || isHelpMessage) {
      return res.json(pollUtil.getPollHelp(userId, command));
    }

    await pollService.processWizePoll(req.body);
  } catch (e) {
    if (e.message === 'INVALID_POLL_COMMAND_MESSAGE') {
      return res.json(pollUtil.getInvalidPollHelp(userId, command, text));
    }
    console.error(__filename, e);
  }

  return res.json({
    response_type: 'ephemeral',
    text: 'Your poll is posted, Cheer :clap:',
  });
}

async function interactive(req, res) {
  console.log(__filename, 'interactive', req.body);
  try {
    pollService.wizePollVote(req.body);
  } catch (e) {
    console.error(__filename, e);
  }
  res.sendStatus(200);
}

module.exports = {
  commandKudos,
  wizePoll,
  interactive,
};
