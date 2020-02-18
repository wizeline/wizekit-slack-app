/* global firebase */

const firebaseConfig = {
  apiKey: 'AIzaSyBtbA5TUn3JsDQOvQL-cDchdiXFEQdtJsw',
  authDomain: 'the-quizz-world.firebaseapp.com',
  databaseURL: 'https://the-quizz-world.firebaseio.com',
  projectId: 'the-quizz-world',
  storageBucket: 'the-quizz-world.appspot.com',
  messagingSenderId: '386454130910',
  appId: '1:386454130910:web:ad568841248a9615dff24f',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const googleAuthNProvider = new firebase.auth.GoogleAuthProvider();
googleAuthNProvider.setCustomParameters({
  hd: 'wizeline.com',
});
