// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase incrustada directamente
const firebaseConfig = {
  apiKey: "AIzaSyDw63q5Hn0TCDIFMggy_YV9PQ-fUvmNDJQ",
  authDomain: "global-stop.firebaseapp.com",
  projectId: "global-stop",
  appId: "1:902072408470:web:a9b19b24c5e791a84865b7",
  messagingSenderId: "902072408470",
};

// Inicializar la aplicación de Firebase de forma robusta para Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtener los servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Crear y exportar los proveedores
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { app, auth, db, googleProvider, facebookProvider };
