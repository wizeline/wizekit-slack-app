const firebase = require('firebase-admin');

firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
  databaseURL: 'https://the-quizz-world.firebaseio.com',
  projectId: process.env.GCP_PROJECT,
});

module.exports = firebase;
