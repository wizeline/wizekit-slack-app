const express = require('express');
const morgan = require('morgan');
const path = require('path');

require('./config/firebase');
const { verifyJwtToken } = require('./config/authentication');
const { isProduction } = require('./util/environment');

const app = express();

app.enable('trust proxy');
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'pug');

if (isProduction) {
  app.use(morgan('combined'));
}

app.use(
  '/api/*',
  verifyJwtToken,
);

app.use('/static', express.static(path.join(process.cwd(), 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.use(require('./router/actuator'));
app.use(require('./router/api.js'));
app.use(require('./router/command'));
app.use(require('./router/interactive'));

module.exports = app;
