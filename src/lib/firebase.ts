
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Your web app's Firebase configuration for global-stop
// This is the CORRECT configuration for the "Stop" app.
export const firebaseConfig = {
    apiKey: "AIzaSyDw63q5Hn0TCDIFMggy_YV9PQ-fUvmNDJQ",
    authDomain: "global-stop.firebaseapp.com",
    databaseURL: "https://global-stop-default-rtdb.firebaseio.com",
    projectId: "global-stop",
    storageBucket: "global-stop.firebasestorage.app",
    messagingSenderId: "902072408470",
    appId: "1:902072408470:web:843e9f91308bb4ec4865b7",
    measurementId: "G-DP1DM3R96E"
  };


// Initialize Firebase App
// This pattern ensures that we don't initialize the app more than once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- App Check ---
if (typeof window !== 'undefined') {
  try {
      const appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider('6Ld-pB8pAAAAAAn_2ENuYTub2z392E5K7lq3yJ9B'),
          isTokenAutoRefreshEnabled: true
      });
  } catch (e) {
      console.error("Error initializing App Check", e);
  }
}

// --- Providers ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();

// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
