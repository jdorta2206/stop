// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration for stop-game-v2
const firebaseConfig = {
  "apiKey": "AIzaSyDgPzz5JbyxIuiCnAkIycqAnKeif9ifcA",
  "authDomain": "stop-game-v2.firebaseapp.com",
  "projectId": "stop-game-v2",
  "storageBucket": "stop-game-v2.appspot.com",
  "messagingSenderId": "668640003802",
  "appId": "1:668640003802:web:a185f56118989cca0c87e3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
