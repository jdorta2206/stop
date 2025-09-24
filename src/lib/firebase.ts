import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Tu configuración REAL de Firebase (de la captura de pantalla)
const firebaseConfig = {
  "projectId": "global-stop",
  "appId": "1:902072408470:web:a9b19b24c5e791a84865b7",
  "apiKey": "AIzaSyDw63q5Hn0TCDIFMggy_YV9PQ-fUvmNDJQ",
  "authDomain": "global-stop.firebaseapp.com",
  "measurementId": "G-P41T2BEMKZ",
  "messagingSenderId": "902072408470"
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
