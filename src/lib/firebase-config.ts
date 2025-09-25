// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration for global-stop
const firebaseConfig = {
  "projectId": "global-stop",
  "appId": "1:668640003802:web:968ab7545b736c9e052061",
  "apiKey": "AIzaSyAF0-gIy3i_hMXuYm2W_5A2F_sAP3Y",
  "authDomain": "global-stop.firebaseapp.com",
  "storageBucket": "global-stop.appspot.com",
  "messagingSenderId": "668640003802"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
