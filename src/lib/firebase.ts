
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase-config';

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Providers ---
// This was the critical error: The auth instance must be passed to the provider constructors.
const googleProvider = new GoogleAuthProvider(auth);
const facebookProvider = new FacebookAuthProvider(auth);


export { app, auth, db, googleProvider, facebookProvider };
