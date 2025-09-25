// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration for stop-game-v2
const firebaseConfig = {
  apiKey: "AIzaSyAJY3Jq9g_NfNnqVO9bY08i9a_3aZa_YjM",
  authDomain: "stop-game-v2.firebaseapp.com",
  projectId: "stop-game-v2",
  storageBucket: "stop-game-v2.appspot.com",
  messagingSenderId: "668640003802",
  appId: "1:668640003802:web:a185f56118989cca0c87e3",
  measurementId: "G-9Q2P2EFT6S"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
