import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB27UcbxtvovOciJDIlOXBAWCTfQtOm038",
  authDomain: "ester-ec20e.firebaseapp.com",
  projectId: "ester-ec20e",
  storageBucket: "ester-ec20e.firebasestorage.app",
  messagingSenderId: "880267816480",
  appId: "1:880267816480:web:f7b86534fd4e2d94d75645",
  measurementId: "G-90N7R5EBQX"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
