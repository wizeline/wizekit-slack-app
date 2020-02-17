/* eslint-disable global-require */
require('dotenv').config({ silent: true });
/* eslint-enable global-require */
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { verifyJwtToken } = require('./src/middleware');
const app = express();

app.set('view engine', 'pug');
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

app.use(require('./src/router/api.js'));
app.use(require('./src/router/command'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = app;
