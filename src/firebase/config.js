import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC0h-z0auQGlH-3oBR-KSy-uFrBEs2JNzE",
  authDomain: "smartsplit-wallet.firebaseapp.com",
  projectId: "smartsplit-wallet",
  storageBucket: "smartsplit-wallet.firebasestorage.app",
  messagingSenderId: "124539330120",
  appId: "1:124539330120:web:4339a2b46ffced9353427d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
