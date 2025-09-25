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
  "appId": "1:668640003802:web:3ae66a52f85c69990c87e3",
  "apiKey": "AIzaSyC1-DSiPhk2aR2qfEPSo1W5A2RAGsAP3Y",
  "authDomain": "global-stop.firebaseapp.com",
  "storageBucket": "global-stop.appspot.com",
  "messagingSenderId": "668640003802"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
