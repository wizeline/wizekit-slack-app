const axios = require('axios').default;
const stringUtil = require('../util/string-util');

const BUTTON_LIST = [
  ':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:',
  ':seven:',
  ':eight:',
  ':nine:',
  ':ten:',
];

async function proccessWizePoll(requestBody) {
  const {
    text, response_url, user_id, command,
  } = requestBody;
  const normalizedText = stringUtil.normalizeDoubleQuote(text);
  if (!isValidatePollMessage(normalizedText)) {
    return Promise.reject(new Error('INVALID_POLL_COMMAND_MESSAGE'));
  }
  const blocks = createPollMessage(normalizedText, user_id, command);
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
  const { text: votedText, votedList } = getVotedData(
    block,
    user.id,
    isIdentified,
  );

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

function isValidatePollMessage(text) {
  const countDoubleQuote = (text.match(/"/g) || []).length;
  return (countDoubleQuote >= 6 && countDoubleQuote % 2 === 0);
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
  } else {
    segments[1] = votedList.map(() => ':thumbsup:').join(' ');
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
    resultText = text.replace(/\s`\d+`\./, ` \`${number}\`.`);
  } else {
    resultText = text.replace(/\s`\d+`\./, '');
  }
  return resultText;
}

function createPollMessage(text, userId, command = '/wizepoll') {
  const pollMeta = getPollMeta(text);
  const removedFlag = text.substring(0, text.lastIndexOf('"'));
  const sections = removedFlag.split('"').filter((t) => t.trim());
  const question = sections.shift();
  const pollBlocks = [];
  if (pollMeta.isAnonymous) {
    pollBlocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            ':ghost: This poll is anonymous. The identity of all responses will be hidden. :see_no_evil: :hear_no_evil: :speak_no_evil:',
        },
      ],
    });
  }

  pollBlocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${question.charAt(0).toUpperCase() + question.slice(1)}*`,
    },
  });

  for (let i = 0; i < sections.length; i += 1) {
    const sectionText = sections[i];
    const buttonText = BUTTON_LIST[i] || BUTTON_LIST[0];

    const actionId = `${pollMeta.isSingle ? 'single' : 'multiple'}-${
      pollMeta.isAnonymous ? 'anonymous' : 'identified'
    }-${i}`;

    pollBlocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${buttonText} ${sectionText}`,
      },
      accessory: {
        type: 'button',
        style: 'primary',
        text: {
          type: 'plain_text',
          text: buttonText,
        },
        action_id: actionId,
      },
    });
  }

  pollBlocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Created by <@${userId}> with \`${command}\` :rocket:.`,
      },
    ],
  });

  return pollBlocks;
}

function getPollMeta(pollText) {
  const flagTextOnly = pollText.replace(/"\w+"/gi, '');
  return {
    isSingle: /single/gi.test(flagTextOnly),
    isAnonymous: /anonymous/gi.test(flagTextOnly),
  };
}

module.exports = {
  proccessWizePoll,
  wizePollVote,
};
