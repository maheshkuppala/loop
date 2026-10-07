// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDiMYu681xVSGeIYO6LCjwcbiqJnZMQKLU",
  authDomain: "looop-reuse.firebaseapp.com",
  projectId: "looop-reuse",
  storageBucket: "looop-reuse.firebasestorage.app",
  messagingSenderId: "517723137134",
  appId: "1:517723137134:web:8d3ef12ac7d5fdb76ef27f",
  measurementId: "G-69D13C47BE"
};

// Initialize Firebase (singleton pattern)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication instance
export const auth = getAuth(app);

// Safe Analytics initialization
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("[Firebase] Analytics initialized successfully.");
    }
  }).catch((err) => {
    console.warn("[Firebase] Analytics initialization warning:", err.message);
  });
}

export default app;
