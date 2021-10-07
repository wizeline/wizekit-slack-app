const jwt = require('jwt-simple');

const { GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_HOSTED_DOMAIN } = process.env;

function verifyJwtToken(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.sendStatus(401);
  }

  const [, idToken] = authHeader.split(' ');
  if (!idToken) {
    return res.sendStatus(401);
  }

  const payload = jwt.decode(idToken, GOOGLE_OAUTH_CLIENT_SECRET);
  if (payload && payload.email && payload.email.endsWith(GOOGLE_OAUTH_HOSTED_DOMAIN)) {
    req.user = payload;
    return next();
  }
  return res.sendStatus(401);
}

module.exports = {
  verifyJwtToken,
};
