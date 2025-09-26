// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration for global-stop
// This is the CORRECT configuration for the "Stop" app.
export const firebaseConfig = {
    apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    authDomain: "global-stop.firebaseapp.com",
    projectId: "global-stop",
    storageBucket: "global-stop.appspot.com",
    messagingSenderId: "902072408470",
    appId: "1:902072408470:web:9db3b3c3c1a3915a12bada",
    measurementId: "G-DP1DM3R96E"
  };


// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- Providers ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
    prompt: 'select_account',
});

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
    'display': 'popup'
});


// Export the initialized services
export { app, auth, db, googleProvider, facebookProvider };
