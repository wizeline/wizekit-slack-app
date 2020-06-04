const axios = require('axios').default;
const { slackWebApi } = require('../config/slack-api');
const stringUtil = require('../util/string-util');

const DASHBOARD_URL = 'https://the-quizz-world.appspot.com/';

async function reactions(reactObj) {
  slackWebApi.reactions.add(reactObj);
}

async function notifiKudosReceiver(slackReceivers, message) {
  const notifiyUsers = slackReceivers.reduce(
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

  return Promise.all(notifiyUsers);
}

async function proccessKudo(commandBody, users = []) {
  if (!users.length) {
    return;
  }
  notifiKudosReceiver(
    users,
    `Hi, <@${commandBody.user_id}> just gave you a kudo!`,
  );
}

async function proccessWizePoll(requestBody) {
  const { text, response_url, user_id } = requestBody;
  const blocks = stringUtil.buildPoll(text, user_id);
  return axios.post(response_url, {
    response_type: 'in_channel',
    blocks,
  });
}

async function wizePollVote(requestBody) {
  const { payload } = requestBody;
  const {
    actions, message, response_url, user,
  } = JSON.parse(payload);
  const block = message.blocks.find(
    (b) => b.accessory && b.accessory.action_id === actions[0].action_id,
  );
  const isIdentified = actions[0].action_id && actions[0].action_id.includes('identified');
  const { text: votedText, votedList } = getVotedData(block, user.id, isIdentified);

  block.text.text = votedText;
  if (votedList) {
    block.accessory.value = votedList;
  } else {
    delete block.accessory.value;
  }

  return axios.post(response_url, {
    blocks: message.blocks,
  });
}

function getVotedData(block, userId, isIdentified = true) {
  const { accessory, text: textObject } = block;
  const { text } = textObject;
  let votedList = [];
  if (accessory.value) {
    votedList = accessory.value.split(',');
    const isVoted = votedList.find((u) => u === userId);
    if (isVoted) {
      votedList = votedList.filter((u) => u !== userId);
    } else {
      votedList.push(userId);
    }
  } else {
    votedList.push(userId);
  }
  const segments = text
    .split('\n')
    .filter((t) => t.trim())
    .slice(0, 2);

  segments[0] = getTextWithCount(segments[0], votedList.length);
  if (isIdentified) {
    segments[1] = votedList.map((u) => `<@${u}>`).join(',');
  }

  return {
    text: segments.join('\n'),
    votedList: votedList.join(','),
  };
}

function getTextWithCount(text, number) {
  let resultText;
  if (!/`\d+`/.test(text)) {
    resultText = `${text} \`${number}\`.`;
  } else if (number > 0) {
    resultText = text.replace(
      /\s`\d+`\./,
      ` \`${number}\`.`,
    );
  } else {
    resultText = text.replace(/\s`\d+`\./, '');
  }
  return resultText;
}

module.exports = {
  reactions,
  proccessKudo,
  proccessWizePoll,
  wizePollVote,
};
