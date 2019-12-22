const { WebClient } = require('@slack/web-api');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;

const slackWebApi = new WebClient(token);

module.exports = {
  slackWebApi,
};
