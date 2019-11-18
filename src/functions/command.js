/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const { asyncMiddleware } = require('../middleware');
const commandService = require('../service/command-service');
const pubSubService = require('../service/pub-sub-service');
const { pickRandom } = require('../util/array-util');

app.use(bodyParser.urlencoded({ extended: false }));

app.post(
  '/commands/kudos-me',
  asyncMiddleware(async function(req, res) {
    console.log('Request body:', req.body);

    try {
      const { mutationResults } = await commandService.save(req.body);
      await pubSubService.publishEvent('kudos-me', mutationResults.pop());
    } catch (e) {
      console.log('error:', e);
    }

    res.json({
      response_type: 'in_channel',
      text: 'You are awesome ' + pickRandom (awesomeIcons) +'.',
    });
  }),
);

const awesomeIcons = [
  ':raised_hands:',
  ':rocket:',
  ':doughnut:',
  ':tada:',
  ':medal:',
  ':trophy:',
  ':sports_medal:',
  ':+1:',
  ':clap:',
  ':100:',
  ':star-struck:',
  ':v:',
];

function start() {
  app.listen(port, () => console.log(`App listening on port ${port}!`));
}

if (require.main === module) {
  start();
}

module.exports = { app };
