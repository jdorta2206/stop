
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore }from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "global-stop.firebaseapp.com",
  projectId: "global-stop",
  storageBucket: "stop-game-v2.appspot.com",
  messagingSenderId: "902072408470",
  appId: "1:902072408470:web:a9b19b24c5e791a84865b7",
  measurementId: "G-P41T2BEMKZ"
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db, firebaseConfig };
