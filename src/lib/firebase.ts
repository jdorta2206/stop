
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase-config';

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Habilitar la persistencia de datos offline (caché)
try {
  enableIndexedDbPersistence(db);
} catch (error: any) {
  if (error.code == 'failed-precondition') {
    // Múltiples pestañas abiertas, la persistencia solo se puede habilitar en una.
    console.warn("Firebase persistence could not be enabled. Multiple tabs open?");
  } else if (error.code == 'unimplemented') {
    // El navegador no soporta la persistencia.
    console.warn("Firebase persistence is not available in this browser.");
  }
}


// --- Providers ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  prompt: 'select_account'
});


export { app, auth, db, googleProvider, facebookProvider };

