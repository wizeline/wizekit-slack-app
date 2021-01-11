const firebase = require('./firebase');

function verifyJwtToken(req, res, next) {
  if (process.env.TURN_OFF_AUTHENTICATION === 'true') {
    return next();
  }

  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.sendStatus(401);
  }

  const idToken = authHeader.split(' ')[1];
  return firebase.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    }).catch((error) => {
      console.warn('Verify Jwt Token', error);
      res.sendStatus(401);
    });
}

module.exports = {
  verifyJwtToken,
};
