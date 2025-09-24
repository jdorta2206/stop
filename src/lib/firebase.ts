
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Tu configuración REAL de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDw63qShh0TCDIFMggy_VV9PQ-fUvmNDJQ",
  authDomain: "global-stop.firebaseapp.com",
  databaseURL: "https://global-stop-default-rtdb.firebaseio.com",
  projectId: "global-stop",
  storageBucket: "global-stop.firebasestorage.app",
  messagingSenderId: "902072408470",
  appId: "1:902072408470:web:843e9f91308bb4ec4865b7",
  measurementId: "G-DPIDN3R96E"
};

// Patrón Singleton para asegurar que Firebase solo se inicialice una vez.
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db, firebaseConfig };
