const SLACK_USER_REGEX = /^<(\S+)\|(.+)>$/i;

function getUserName(slackUser) {
  return slackUser.match(SLACK_USER_REGEX)[2];
}

function getUserCode(slackUser) {
  return slackUser.match(SLACK_USER_REGEX)[1];
}

module.exports = {
  getUserName,
  getUserCode,
};
