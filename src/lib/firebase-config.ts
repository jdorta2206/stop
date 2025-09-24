// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC40a-5c2A6553A5j1tkK1iAYQ",
  authDomain: "stop-game-v2.firebaseapp.com",
  projectId: "stop-game-v2",
  storageBucket: "stop-game-v2.appspot.com",
  messagingSenderId: "931758525832",
  appId: "1:931758525832:web:6e6f7b9c4c44243128c73c",
  measurementId: "G-85P0DBV5G3"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
