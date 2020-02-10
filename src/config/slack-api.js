const { WebClient } = require('@slack/web-api');
const token = process.env.SLACK_TOKEN;
const slackApi = new WebClient(token);

module.exports = {
  slackApi
}
