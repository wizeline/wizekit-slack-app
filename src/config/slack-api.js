const { WebClient } = require('@slack/web-api');

const token = process.env.SLACK_TOKEN;
const slackWebApi = new WebClient(token);

module.exports = slackWebApi;
