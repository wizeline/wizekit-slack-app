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

function buildPoll(text) {
  const normalizedText = text.replace(/“|”/gi, '"');
  const pollMeta = getPollMeta(normalizedText);
  const sections = normalizedText.split('"').filter((t) => t.trim());

  const question = sections.shift();
  const pollBlocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${question}*`,
      },
    },
  ];

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
        value: '',
        action_id: actionId,
      },
    });
  }
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
