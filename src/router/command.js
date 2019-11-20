/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */

const express = require('express');
const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const commandService = require('../service/command-service');
const pubSubService = require('../service/pub-sub-service');
const { pickRandom } = require('../util/array-util');

router.post(
  '/commands/kudos-me',
  asyncMiddleware(async function(req, res) {
    console.log('Request body:', req.body);
    try {
      const commandEntity = await commandService.save(req.body);
      await pubSubService.publishEvent('kudos-me', commandEntity);
    } catch (e) {
      console.error('error:', e);
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

module.exports = router;
