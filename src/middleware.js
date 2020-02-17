const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://the-quizz-world.firebaseio.com',
  projectId: process.env.GCP_PROJECT,
});

const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

function verifyJwtToken(req, res, next) {
  const idToken = req.header('Authorization').split(' ')[1];
  return admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    }).catch((error) => {
      console.warn('Verify Jwt Token', error);
      res.sendStatus(401);
    });
}

module.exports = {
  asyncMiddleware,
  verifyJwtToken,
};
