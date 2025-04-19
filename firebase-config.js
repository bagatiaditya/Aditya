// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCG7lvUR5kkemzeByfAh84L_MyNAgSgE8s",
  authDomain: "trustchain-59c7d.firebaseapp.com",
  projectId: "trustchain-59c7d",
  storageBucket: "trustchain-59c7d.appspot.com",
  messagingSenderId: "280571291668",
  appId: "1:280571291668:web:3f1a16432250f4847a9f01"
};

// Initialize Firebase only if it hasn't been initialized yet
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else if (typeof firebase !== 'undefined') {
  // Use existing app
  firebase.app();
}

// Export auth references for other files to use
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Make it available to window object
window.firebaseConfig = firebaseConfig;
window.firebaseAuth = auth;
window.firebaseDb = db;

// Note: The actual initialization is done in the individual JS files
// to prevent multiple initialization errors when multiple pages use Firebase 