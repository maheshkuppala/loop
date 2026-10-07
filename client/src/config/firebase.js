import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";

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

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
};

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
