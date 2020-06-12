const SLACK_USER_REGEX = /^<(\S+)\|(.+)>$/i;

function getUserName(slackUser) {
  const match = slackUser.match(SLACK_USER_REGEX);
  return match ? match[2] : '';
}

function getUserCode(slackUser) {
  const match = slackUser.match(SLACK_USER_REGEX);
  return match ? match[1] : '';
}

function normalizeDoubleQuote(text) {
  return text.replace(/“|”/gi, '"');
}

module.exports = {
  getUserName,
  getUserCode,
  normalizeDoubleQuote,
};
