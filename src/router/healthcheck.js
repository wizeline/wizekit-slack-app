const express = require('express');

const router = express.Router();
const { asyncMiddleware } = require('../middleware');

router.get(
  '/healthcheck',
  asyncMiddleware((res, req) => req.json({ message: 'I\'m OK.' })),
);

module.exports = router;
