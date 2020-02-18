const SLACK_USER_REGEX = /^<(\S+)\|(.+)>$/i;

function getUserName(slackUser) {
  const match = slackUser.match(SLACK_USER_REGEX);
  return match ? match[2] : '';
}

function getUserCode(slackUser) {
  const match = slackUser.match(SLACK_USER_REGEX);
  return match ? match[1] : '';
}

module.exports = {
  getUserName,
  getUserCode,
};
