
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSZpzKgLLm2dUj8QEcDuc8NYI0GGy78uw",
  authDomain: "helpkey-a8fab.firebaseapp.com",
  projectId: "helpkey-a8fab",
  storageBucket: "helpkey-a8fab.firebasestorage.app",
  messagingSenderId: "897248682595",
  appId: "1:897248682595:web:d5ea70e45f274317804e56",
  measurementId: "G-HS1981H7MD"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, db, googleProvider };