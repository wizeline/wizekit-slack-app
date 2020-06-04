const SLACK_USER_REGEX = /^<(\S+)\|(.+)>$/i;
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

function getUserName(slackUser) {
  const match = slackUser.match(SLACK_USER_REGEX);
  return match ? match[2] : '';
}

function getUserCode(slackUser) {
  const match = slackUser.match(SLACK_USER_REGEX);
  return match ? match[1] : '';
}

function buildPoll(text, userId) {
  const normalizedText = text.replace(/“|”/gi, '"');
  const pollMeta = getPollMeta(normalizedText);
  const removeFlag = normalizedText.substring(0, normalizedText.lastIndexOf('"'));
  const sections = removeFlag.split('"').filter((t) => t.trim());
  const question = sections.shift();
  const pollBlocks = [];
  if (pollMeta.anonymous) {
    pollBlocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: ':ghost: This poll is anonymous. The identity of all responses will be hidden. :see_no_evil: :hear_no_evil: :speak_no_evil:',
      }],
    });
  }
  pollBlocks.push(
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${question.charAt(0).toUpperCase() + question.slice(1)}*`,
      },
    },
  );

  for (let i = 0; i < sections.length; i += 1) {
    const sectionText = sections[i];
    const buttonText = BUTTON_LIST[i] || BUTTON_LIST[0];

    const actionId = `${pollMeta.single ? 'single' : 'multiple'}-${
      pollMeta.anonymous ? 'anonymous' : 'identified'
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
  pollBlocks.push(
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Created by <@${userId}> with \`/wizepoll\` :rocket:`,
        },
      ],
    },
  );
  return pollBlocks;
}

function getPollMeta(pollText) {
  const cleanedContent = pollText.replace(/"\w+"/gi, '');
  return {
    single: /single/gi.test(cleanedContent),
    anonymous: /anonymous/gi.test(cleanedContent),
  };
}

module.exports = {
  getUserName,
  getUserCode,
  buildPoll,
};
