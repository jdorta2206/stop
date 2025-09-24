
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// CONFIGURACIÓN DE EJEMPLO - REEMPLAZAR CON LA DE TU NUEVO PROYECTO
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU-PROJECT-ID.firebaseapp.com",
  projectId: "TU-PROJECT-ID",
  storageBucket: "TU-PROJECT-ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID"
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
