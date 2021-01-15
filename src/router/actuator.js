const express = require('express');
const packageJson = require('../../package.json');

const router = express.Router();
const { asyncMiddleware } = require('../config/middleware');

router.get(
  '/health',
  asyncMiddleware((res, req) => req.json({ message: 'I\'m OK.' })),
);

router.get(
  '/info',
  asyncMiddleware((res, req) => req.json({
    description: 'WizeKit Slack App',
    version: packageJson.version,
    commitSha: process.env.COMMIT_SHA,
  })),
);

module.exports = router;
