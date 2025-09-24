
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore }from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "stop-game-v2.firebaseapp.com",
  projectId: "stop-game-v2",
  storageBucket: "stop-game-v2.appspot.com",
  messagingSenderId: "397399335694",
  appId: "1:397399335694:web:53d3f448c34f2d338f972b"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
