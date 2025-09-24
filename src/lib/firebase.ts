
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// CONFIGURACIÓN DE EJEMPLO - REEMPLAZAR CON LA DE TU NUEVO PROYECTO
const firebaseConfig = {
  apiKey: "AIzaSyDgPzz5JbyxluiaCnakIycqAnKeif9ifcA",
  authDomain: "stop-game-v2.firebaseapp.com",
  projectId: "stop-game-v2",
  storageBucket: "stop-game-v2.firebasestorage.app",
  messagingSenderId: "668640003802",
  appId: "1:668640003802:web:a185f56118989cca0c87e3"
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
