// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Your web app's Firebase configuration for stop-game-v2
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase App
// This pattern ensures that we don't initialize the app more than once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize App Check
if (typeof window !== 'undefined') {
  // Pass your reCAPTCHA v3 site key (public) to the provider.
  // This key is public and safe to expose.
  try {
    const appCheck = initializeAppCheck(app, {
      // IMPORTANT: Replace with your actual public reCAPTCHA site key from the Google Cloud console if needed.
      provider: new ReCaptchaV3Provider('6Ld-pB8pAAAAAAn_2ENuYTub2z392E5K7lq3yJ9B'), 
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.error("Error initializing Firebase App Check:", error);
  }
}


// --- Providers ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();

// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
