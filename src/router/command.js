const express = require('express');

const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const commandController = require('../controller/command-controller');

router.post(
  '/commands/kudos-me',
  asyncMiddleware(commandController.slackCommandKudos),
);


module.exports = router;
