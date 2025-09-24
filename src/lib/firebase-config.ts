// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "stop-game-v2",
  "appId": "1:902072408470:web:4c9339a2d8f668584865b7",
  "apiKey": "AIzaSyBlbFfU0VvQ7a4rkbTV2m_53a_G1f5n_J8",
  "authDomain": "stop-game-v2.firebaseapp.com",
  "storageBucket": "stop-game-v2.appspot.com",
  "messagingSenderId": "902072408470"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
