// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration for global-stop
export const firebaseConfig = {
  apiKey: "AIzaSyC2k78iF5f3c7A9b1e7D5fG3h2j1k9L8M",
  authDomain: "global-stop.firebaseapp.com",
  projectId: "global-stop",
  storageBucket: "global-stop.appspot.com",
  messagingSenderId: "902072408470",
  appId: "1:902072408470:web:8c51e0b0e51701354865b7",
  measurementId: "G-P41T2BEMKZ"
};


// Initialize Firebase App
// This pattern ensures that we don't initialize the app more than once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- Providers ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();

// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
