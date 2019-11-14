const { app : commandApp } = require('./functions/command');
const { commandSub } = require('./functions/subscriber');

module.exports = {
  commandApp,
  commandSub
}
