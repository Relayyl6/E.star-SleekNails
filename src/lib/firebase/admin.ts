import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newline characters in the private key from env variables
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ester-ec20e.firebasestorage.app'
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('FIREBASE_PRIVATE_KEY is missing. Admin SDK will not be initialized.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

// Export getters instead of values to prevent immediate crash if app isn't initialized
export const getAdminDb = () => getFirestore();
export const getAdminAuth = () => getAuth();
export const getAdminStorage = () => getStorage();
