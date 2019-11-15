/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */

const express = require('express');
const app = express();
const port = 3000;
const { asyncMiddleware } = require('../middleware');
const kudosController = require('../controller/kudos-controller');
const commandController = require('../controller/command-controller');

app.enable('trust proxy');

app.get(
  '/api/kudos/leaderboard',
  asyncMiddleware(kudosController.getLeaderboard),
);

app.get('/api/commands/kudos', asyncMiddleware(commandController.search));

function start() {
  app.listen(port, () => console.log(`App listening on port ${port}!`));
}

if (require.main === module) {
  start();
}

module.exports = { app };
