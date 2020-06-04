const express = require('express');

const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const slackController = require('../controller/slack-controller');

router.post(
  '/interactive/endpoint',
  asyncMiddleware(slackController.interactive),
);

module.exports = router;
