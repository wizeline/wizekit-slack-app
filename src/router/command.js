const express = require('express');
const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const commandService = require('../service/command-service');
const kudosService = require('../service/kudo-service');
const { pickRandom } = require('../util/array-util');

router.post(
  '/commands/kudos-me',
  asyncMiddleware(async function(req, res) {
    console.log('Request Body:', req.body);

    try {
      const commandEntity = await commandService.save(req.body);
      const { text, user_name } = req.body;
      const users = kudosService.getUserList(text, user_name);
      const kudoList = kudosService.createKudoList(users, commandEntity);
      kudosService.save(kudoList);
    } catch (e) {
      console.error('Error:', e);
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
