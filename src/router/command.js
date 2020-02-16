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
      const { text, user_name, channel_name, user_id } = req.body;
      if( !text || !user_name ){
        res.json({
          response_type: 'in_channel'
        });
      }
      const commandEntity = await commandService.save(req.body);
      if( channel_name === 'directmessage') {
        return res.json({
          response_type: 'in_channel',
          text:`Hi <@${user_id}>, \`/kudos\` doesn't work on Direct Message or Private Channel`
        });
      }
      const users = kudosService.getUserList(text, user_name);
      const kudoList = kudosService.createKudoList(users, commandEntity);
      kudosService.save(kudoList);
    } catch (e) {
      console.error('Error:', e);
    }

    res.json({
      response_type: 'in_channel'
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
