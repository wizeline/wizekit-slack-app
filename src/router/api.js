const express = require('express');

const router = express.Router();

const { asyncMiddleware } = require('../config/middleware');
const kudosController = require('../controller/kudos-controller');
const commandController = require('../controller/command-controller');
const userController = require('../controller/user-controller');
const pollController = require('../controller/poll-controller');

router.get(
  '/api/kudos/leaderboard',
  asyncMiddleware(kudosController.getLeaderBoard),
);

router.get(
  '/api/commands/kudos',
  asyncMiddleware(commandController.search),
);

router.get(
  '/api/commands/polls',
  asyncMiddleware(pollController.search),
);

router.get(
  '/api/users/',
  asyncMiddleware(userController.search),
);

module.exports = router;
