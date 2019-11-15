/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */

const express = require('express');
const app = express();
const port = 3000;
const { asyncMiddleware } = require('../middleware');
const kudosController = require('../controller/kudos-controller');


app.enable('trust proxy');

app.get(
  '/api/kudos/',
  asyncMiddleware(kudosController.search),
);

function start() {
  app.listen(port, () => console.log(`App listening on port ${port}!`));
}

if (require.main === module) {
  start();
}

module.exports = { app };
