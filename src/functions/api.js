/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */

const express = require('express');
const app = express();
const port = 3000;
const { asyncMiddleware } = require('../middleware');
const kudoService = require('../service/kudo-service');

app.get(
  '/api/kudos/',
  asyncMiddleware(async function(req, res) {
    const kudoList = await kudoService.search(req);
    res.json(kudoList);
  }),
);

function start() {
  app.listen(port, () => console.log(`App listening on port ${port}!`));
}

if (require.main === module) {
  start();
}

module.exports = { app };
