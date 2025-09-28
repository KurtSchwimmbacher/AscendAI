// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRA9_SV-xsIT-EkbYZclGauyE3Dnh0lBo",
  authDomain: "ascendai-53419.firebaseapp.com",
  projectId: "ascendai-53419",
  storageBucket: "ascendai-53419.firebasestorage.app",
  messagingSenderId: "65014958058",
  appId: "1:65014958058:web:a41afaf34cfc44e49e5493"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
