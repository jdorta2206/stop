// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "global-stop",
  "appId": "1:902072408470:web:a9b19b24c5e791a84865b7",
  "apiKey": "AIzaSyDw63q5Hn0TCDIFMggy_YV9PQ-fUvmNDJQ",
  "authDomain": "global-stop.firebaseapp.com",
  "storageBucket": "global-stop.appspot.com",
  "messagingSenderId": "902072408470"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
