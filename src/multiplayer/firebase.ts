import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDZSU82Zgj_KQe167Xi3U9c9_qGqDGWg8g',
  authDomain: 'twozy-97fdd.firebaseapp.com',
  projectId: 'twozy-97fdd',
  storageBucket: 'twozy-97fdd.firebasestorage.app',
  messagingSenderId: '914371705628',
  appId: '1:914371705628:web:951c2a4366fa7783a118d9',
  measurementId: 'G-VGDF9C1SR1',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** The Firebase package selects its React Native Auth build on native platforms. */
export const firebaseAuth = getAuth(app);

export async function getAnonymousUserId(): Promise<string> {
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('Firebase anonymous sign-in did not complete.');
  return user.uid;
}

export function getTwozyDatabase(): Database {
  const databaseUrl = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Realtime Database is not configured. Set EXPO_PUBLIC_FIREBASE_DATABASE_URL in .env.');
  }
  return getDatabase(app, databaseUrl);
}
