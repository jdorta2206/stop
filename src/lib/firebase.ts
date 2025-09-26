// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Your web app's Firebase configuration for global-stop
export const firebaseConfig = {
  apiKey: "AIzaSyDw53q5HnBTCDIFMggy_YV9PQ-fUvrNDJQ",
  authDomain: "global-stop.firebaseapp.com",
  projectId: "global-stop",
  storageBucket: "global-stop.appspot.com",
  messagingSenderId: "902072408470",
  appId: "1:902072408470:web:a9b19b24c5e791a84865b7",
  measurementId: "G-P41T2BEMKZ"
};


// Initialize Firebase App
// This pattern ensures that we don't initialize the app more than once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize App Check
// if (typeof window !== 'undefined') {
//   // Pass your reCAPTCHA v3 site key (public) to the provider.
//   // Make sure to add this to your environment variables.
//   // IMPORTANT: This key is public and safe to expose.
//   const appCheck = initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider('6Ld-pB8pAAAAAAn_2ENuYTub2z392E5K7lq3yJ9B'), // Replace with your actual public reCAPTCHA site key
//     isTokenAutoRefreshEnabled: true
//   });
// }


// --- Providers ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();

// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
