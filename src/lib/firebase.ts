// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, memoryGarbageCollector } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase-config';

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with robust offline persistence for Firebase v10+
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    garbageCollector: memoryGarbageCollector({})
  })
});


// --- Providers ---
const googleProvider = new GoogleAuthProvider();
// Forzar selección de cuenta para evitar problemas de caché y dar control al usuario.
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
// Forzar selección de cuenta y asegurar que se solicitan los campos necesarios.
facebookProvider.setCustomParameters({
  'fields': 'id,name,email,picture',
  'prompt': 'select_account'
});


export { app, auth, db, googleProvider, facebookProvider };
