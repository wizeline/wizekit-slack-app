'use strict';
/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

app.use(require('./src/router/api.js'));
app.use(require('./src/router/command'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
