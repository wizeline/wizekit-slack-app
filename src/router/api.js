const express = require('express');
const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const kudosController = require('../controller/kudos-controller');
const commandController = require('../controller/command-controller');
const userController = require('../controller/user-controller');

router.get(
  '/api/healthcheck',
  asyncMiddleware((res, req) => req.json({ message: 'I\'m OK.' })),
);

router.get(
  '/api/kudos/leaderboard',
  asyncMiddleware(kudosController.getLeaderboard),
);

router.get(
  '/api/commands/kudos',
  asyncMiddleware(commandController.search)
);

router.get(
  '/api/users/',
  asyncMiddleware(userController.search)
);

module.exports = router;
