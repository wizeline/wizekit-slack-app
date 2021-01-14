const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { verifyJwtToken } = require('./config/authentication');

const app = express();

app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

app.use(
  '/api/*',
  verifyJwtToken,
);

app.use('/static', express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.use(require('./router/healthcheck'));
app.use(require('./router/api.js'));
app.use(require('./router/command'));
app.use(require('./router/interactive'));

module.exports = app;
