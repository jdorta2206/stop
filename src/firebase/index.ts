'use client';

import { firebaseConfig } from './config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;

// Asegura que Firebase se inicialice solo una vez.
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  return { firebaseApp, auth, firestore };
}

export function getSdks() {
  return {
    firebaseApp,
    auth,
    firestore,
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
