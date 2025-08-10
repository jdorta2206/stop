
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
// Esta es la forma correcta para Firebase v9+ y soluciona el problema de bloqueo.
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
// Forzar selección de cuenta para evitar problemas de caché y dar control al usuario.
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const facebookProvider = new FacebookAuthProvider();
// Forzar selección de cuenta y asegurar que se solicitan los campos necesarios.
facebookProvider.setCustomParameters({
  'prompt': 'select_account'
});

export { app, auth, db, googleProvider, facebookProvider };
