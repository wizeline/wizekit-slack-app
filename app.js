'use strict';
/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
