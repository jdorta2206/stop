// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';

// Inicializar la aplicación de Firebase de forma robusta para Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtener los servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Crear y exportar los proveedores
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { app, auth, db, googleProvider, facebookProvider };
