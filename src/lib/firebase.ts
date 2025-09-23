
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
  try {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LdOutlrAAAAAHyftbN3PIP8s72soDyqcUsCehiQ'), 
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
// Solución: Añadir scopes y parámetros personalizados para robustecer la petición de OAuth.
facebookProvider.addScope('email');
facebookProvider.setCustomParameters({
  'display': 'popup'
});


// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
