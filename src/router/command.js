const express = require('express');

const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const slackController = require('../controller/slack-controller');

router.post(
  '/commands/kudos-me',
  asyncMiddleware(slackController.commandKudos),
);

module.exports = router;
