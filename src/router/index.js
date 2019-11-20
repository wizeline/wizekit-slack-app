const commandKudos = require('./command');
const api = require('./api');

module.exports = function(app){
  app.use(commandKudos);
  app.use(api);
}
