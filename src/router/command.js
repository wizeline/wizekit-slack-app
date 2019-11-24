const express = require('express');

const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const commandService = require('../service/command-service');
const kudosService = require('../service/kudo-service');

router.post(
  '/commands/kudos-me',
  asyncMiddleware(async (req, res) => {
    console.log('Request Body:', req.body);

    try {
      const commandEntity = await commandService.save(req.body);
      const {
        text, user_name: userName, channel_name: channelName, user_id: userId,
      } = req.body;
      if (channelName === 'directmessage') {
        return res.json({
          response_type: 'in_channel',
          text: `Hi <@${userId}>, \`/kudos\` doesn't work on Direct Message or Private Channel`,
        });
      }
      const users = kudosService.getUserList(text, userName);
      const kudoList = kudosService.createKudoList(users, commandEntity);
      kudosService.save(kudoList);
    } catch (e) {
      console.error('Error:', e);
    }

    return res.json({
      response_type: 'in_channel',
    });
  }),
);


module.exports = router;
