// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOjxiCGtAp8Gj2hi_GcjFc1nV4o-0c6jA",
  authDomain: "videoapp-129d6.firebaseapp.com",
  projectId: "videoapp-129d6",
  storageBucket: "videoapp-129d6.appspot.com",
  messagingSenderId: "898903776141",
  appId: "1:898903776141:web:24294bc0afe6f98c783bc4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
