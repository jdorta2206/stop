// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo_y3GDR4BQA3S3pD8F9M6An5t4k",
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
