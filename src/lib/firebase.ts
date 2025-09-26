// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV3-p-gHkIs-k37M284xar7e_pYjVpYyA",
  authDomain: "global-stop.firebaseapp.com",
  projectId: "global-stop",
  storageBucket: "global-stop.appspot.com",
  messagingSenderId: "902072408470",
  appId: "1:902072408470:web:9db3b3c3c1a3915a12bada",
  measurementId: "G-DP1DM3R96E",
};


// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- Providers ---
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();


// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
