// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseConfig } from '@/lib/firebase-config';

// Initialize Firebase App
// This pattern ensures that we don't initialize the app more than once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize App Check
if (typeof window !== 'undefined') {
  // Pass your reCAPTCHA v3 site key (public) to the provider.
  // Make sure to add this to your environment variables.
  // IMPORTANT: This key is public and safe to expose.
  try {
    // TODO: Replace with your actual public reCAPTCHA site key from the Google Cloud console.
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6Ld-pB8pAAAAAAn_2ENuYTub2z392E5K7lq3yJ9B'), 
      isTokenAutoRefreshEnabled: true
    });
    console.log("Firebase App Check initialized successfully.");
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
