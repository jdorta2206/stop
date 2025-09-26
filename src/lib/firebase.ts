// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration for global-stop
// This is the CORRECT configuration for the "Stop" app.
export const firebaseConfig = {
    apiKey: "AIzaSyDw63q5Hn0TCDIFMggy_YV9PQ-fUvmNDJQ",
    authDomain: "global-stop.firebaseapp.com",
    databaseURL: "https://global-stop-default-rtdb.firebaseio.com",
    projectId: "global-stop",
    storageBucket: "global-stop.appspot.com",
    messagingSenderId: "902072408470",
    appId: "1:902072408470:web:9db3b3c3c1a3915a12bada",
    measurementId: "G-DP1DM3R96E"
  };


// Initialize Firebase App
// This pattern ensures that we don't initialize the app more than once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- App Check ---
// App Check has been temporarily disabled to resolve a reCAPTCHA configuration issue.
// Once the reCAPTCHA key is correctly configured in the Google Cloud Console for the
// correct domains (including localhost), this can be re-enabled.
/*
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
*/

// --- Providers ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();

// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
