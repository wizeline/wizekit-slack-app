const { app : commandApp } = require('./functions/command');
const { app : apiApp } = require('./functions/api');
const { commandSub } = require('./functions/subscriber');

module.exports = {
  commandApp,
  commandSub,
  apiApp,
}
