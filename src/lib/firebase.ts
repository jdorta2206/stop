
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase-config';

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with robust offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}),
});


// --- Providers ---
const googleProvider = new GoogleAuthProvider();

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
facebookProvider.setCustomParameters({
  'fields': 'id,name,email,picture'
});


export { app, auth, db, googleProvider, facebookProvider };
