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
    console.warn('[Firebase Google Auth]', error.code, error.message);
    if (error.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'loop-five-azure.vercel.app';
      throw new Error(`Domain "${currentHost}" is not added to Firebase Authorized Domains yet.`);
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-in was cancelled.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked by browser. Please allow popups or use Email OTP.');
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
