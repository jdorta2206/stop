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
  "appId": "1:668640003802:web:a185f56118989cca0c87e3",
  "apiKey": "AIzaSyDgPzz5JbyxIuiaCnaklycqAnKeifOfcA",
  "authDomain": "stop-game-v2.firebaseapp.com",
  "storageBucket": "stop-game-v2.appspot.com",
  "messagingSenderId": "668640003802"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
