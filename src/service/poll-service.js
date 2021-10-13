const axios = require('axios').default;
const stringUtil = require('../util/string-util');
const { POWERED_BY, HELP_MESSAGE } = require('../message');
const pollDbService = require('./poll-service-db');

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

const OPTION_JUST_SMILE = 'just-smile';
const OPTION_NEED_HELP = 'need-help';

async function processWizePoll(requestBody) {
  const {
    text, response_url, user_id, command, token, trigger_id, ...restRequestBody
  } = requestBody;
  const normalizedText = stringUtil.normalizeDoubleQuote(text);
  if (!isValidatePollMessage(normalizedText)) {
    return Promise.reject(new Error('INVALID_POLL_COMMAND_MESSAGE'));
  }
  const blocks = createPollMessage(normalizedText, user_id, command);
  pollDbService.save([{
    text,
    user_id,
    command,
    ...restRequestBody,
  }]);
  return axios.post(response_url, {
    response_type: 'in_channel',
    blocks,
  });
}

async function wizePollVote(requestBody) {
  const { payload } = requestBody;
  const {
    actions, message, response_url, user, token, trigger_id, ...restRequestBody
  } = JSON.parse(payload);
  pollDbService.save([{
    actions,
    message,
    user,
    ...restRequestBody,
  }]);
  const action = actions[0];
  if (action.type === 'overflow') {
    const { value: selectedValue } = action.selected_option;
    const matches = selectedValue.match(/delete-poll-((\w|\d)*)/);
    if (matches) {
      const userCreatedPoll = matches[1];
      if (user.id === userCreatedPoll) {
        return axios.post(response_url, {
          delete_original: true,
        });
      }
      return axios.post(response_url, {
        response_type: 'ephemeral',
        replace_original: false,
        text: ':sweat_smile: Ufff! Only the poll creator can delete the poll.',
      });
    } if (selectedValue === OPTION_NEED_HELP) {
      return axios.post(response_url, {
        response_type: 'ephemeral',
        replace_original: false,
        text: HELP_MESSAGE,
      });
    }
    return axios.post(response_url, {
      response_type: 'ephemeral',
      replace_original: false,
      text: 'Thank you and keep smiling :smile: :smile: :smile: ',
    });
  }
  const isIdentified = action
    && action.action_id
    && action.action_id.includes('identified');
  const isSingle = action
    && action.action_id
    && action.action_id.includes('single');

  const blocks = isSingle
    ? getSingleVoteReplyMessage(action, message.blocks, user.id, isIdentified)
    : getMultipleVoteReplyMessage(
      action,
      message.blocks,
      user.id,
      isIdentified,
    );
  return axios.post(response_url, {
    blocks,
  });
}

function isValidatePollMessage(text) {
  const countDoubleQuote = (text.match(/"/g) || []).length;
  return countDoubleQuote >= 6 && countDoubleQuote % 2 === 0;
}

function getSingleVoteReplyMessage(
  action,
  allBlocks,
  userId,
  isIdentified = true,
) {
  return allBlocks.map((block) => {
    if (block.accessory && block.accessory.type === 'button') {
      if (block.accessory.action_id === action.action_id) {
        return addOrRemoveUserFromBlock(block, userId, isIdentified);
      }
      return removeUserFromBlock(block, userId, isIdentified);
    }
    return block;
  });
}

function getMultipleVoteReplyMessage(
  action,
  allBlocks,
  userId,
  isIdentified = true,
) {
  const resultBlocks = [...allBlocks];
  const selectedBlockIndex = allBlocks.findIndex(
    (b) => b.accessory && b.accessory.action_id === action.action_id,
  );
  resultBlocks[selectedBlockIndex] = addOrRemoveUserFromBlock(
    allBlocks[selectedBlockIndex],
    userId,
    isIdentified,
  );
  return resultBlocks;
}

function addOrRemoveUserFromBlock(block, userId, isIdentifiedMessage = true) {
  const votedList = addOrRemoveUserToVotedList(block, userId);
  return createMessageBlock(block, votedList, isIdentifiedMessage);
}

function removeUserFromBlock(block, userId, isIdentifiedMessage = true) {
  const votedList = removeUserFromVotedList(block, userId);
  return createMessageBlock(block, votedList, isIdentifiedMessage);
}

function createMessageBlock(block, votedList, isIdentifiedMessage) {
  const blockResult = { ...block };
  const votedListText = votedList.join(',');
  const newSelectedBlockText = createBlockMessage(
    block,
    votedList,
    isIdentifiedMessage,
  );
  blockResult.text.text = newSelectedBlockText;
  if (votedListText) {
    blockResult.accessory.value = votedListText;
  } else {
    delete blockResult.accessory.value;
  }
  return blockResult;
}

function addOrRemoveUserToVotedList(block, userId) {
  const { accessory } = block;
  let votedList = [];
  if (accessory.value) {
    votedList = accessory.value.split(',');
    const isExisted = votedList.find((u) => u === userId);
    if (isExisted) {
      votedList = votedList.filter((u) => u !== userId);
    } else {
      votedList.push(userId);
    }
  } else {
    votedList.push(userId);
  }
  return votedList;
}

function removeUserFromVotedList(block, userId) {
  const { accessory } = block;
  let votedList = [];
  if (accessory.value) {
    votedList = accessory.value.split(',');
    return votedList.filter((u) => u !== userId);
  }
  return votedList;
}

function createBlockMessage(block, votedList, isIdentifiedMessage = true) {
  const { text: textObject } = block;
  const { text } = textObject;
  const segments = text
    .split('\n')
    .filter((t) => t.trim())
    .slice(0, 2);

  segments[0] = getTextWithCount(segments[0], votedList.length);
  if (isIdentifiedMessage) {
    segments[1] = votedList.map((u) => `<@${u}>`).join(',');
  } else {
    segments[1] = votedList.map(() => ':ghost:').join(' ');
  }
  return segments.join('\n');
}

function getTextWithCount(text, number) {
  let resultText;
  if (!/`\d+`/.test(text) && number > 0) {
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
  if (sections.length < 3) {
    throw new Error('INVALID_POLL_COMMAND_MESSAGE');
  }
  const question = sections.shift();
  const pollBlocks = [];
  if (pollMeta.isAnonymous) {
    pollBlocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text:
            ':ghost: This poll is anonymous with multiple choice. The identity of all responses will be hidden. :see_no_evil: :hear_no_evil: :speak_no_evil:',
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
    accessory: {
      type: 'overflow',
      options: [
        {
          text: {
            type: 'plain_text',
            text: 'Just :smile:',
            emoji: true,
          },
          value: OPTION_JUST_SMILE,
        },
        {
          text: {
            type: 'plain_text',
            text: ':x: Delete Poll',
            emoji: true,
          },
          value: `delete-poll-${userId}`,
        },
        {
          text: {
            type: 'plain_text',
            text: ':call_me_hand: Need help',
            emoji: true,
          },
          value: OPTION_NEED_HELP,
        },
      ],
    },
  });

  for (let i = 0; i < sections.length; i += 1) {
    const sectionText = sections[i];
    const buttonText = BUTTON_LIST[i] || BUTTON_LIST[0];

    const actionId = `${pollMeta.isSingle ? 'single' : 'multiple'}-${pollMeta.isAnonymous ? 'anonymous' : 'identified'
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
        text: `Created by <@${userId}> with \`${command}\` :rocket:. ${POWERED_BY}`,
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
  processWizePoll,
  wizePollVote,
};
