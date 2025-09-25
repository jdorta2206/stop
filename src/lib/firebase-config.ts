// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration for stop-game-v2
const firebaseConfig = {
  "projectId": "stop-game-v2",
  "appId": "1:902072408470:web:d27ce6f33f6d557342111c",
  "apiKey": "AIzaSyCpj-3x5w_aPj8kYj3xQ9yZ2j1wX8_vY4s",
  "authDomain": "stop-game-v2.firebaseapp.com",
  "storageBucket": "stop-game-v2.appspot.com",
  "messagingSenderId": "902072408470"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
