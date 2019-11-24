const express = require('express');

const router = express.Router();

const { asyncMiddleware } = require('../middleware');
const kudosController = require('../controller/kudos-controller');
const commandController = require('../controller/command-controller');

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
  asyncMiddleware(commandController.search),
);

module.exports = router;
