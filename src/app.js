const express = require('express');
const morgan = require('morgan');

const { verifyJwtToken } = require('./config/authentication');
const { isProduction } = require('./util/environment');

const app = express();

app.enable('trust proxy');
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

if (isProduction) {
  app.use(morgan('combined'));
}

app.use(
  '/api/*',
  verifyJwtToken,
);

app.use(require('./router/actuator'));
app.use(require('./router/api'));
app.use(require('./router/command'));
app.use(require('./router/interactive'));

module.exports = app;
