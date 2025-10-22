import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let _app = null;
let _db = null;
let _auth = null;
let _googleProvider = null;

export function isFirebaseAvailable() {
  return (typeof window !== 'undefined') && !!firebaseConfig.apiKey;
}

function initFirebaseOnce() {
  if (!isFirebaseAvailable()) return null;
  if (_app) return _app;

  // initializeApp throws if already initialized in some environments, so guard with getApps/getApp
  try {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch (err) {
    // fallback to getApp
    _app = getApp();
  }

  _db = getFirestore(_app);
  _auth = getAuth(_app);
  _googleProvider = new GoogleAuthProvider();

  return _app;
}

export function getFirebaseApp() {
  return initFirebaseOnce();
}

export function getFirestoreDb() {
  if (!_db) initFirebaseOnce();
  return _db;
}

export function getFirebaseAuth() {
  if (!_auth) initFirebaseOnce();
  return _auth;
}

export function getFirebaseProvider() {
  if (!_googleProvider) initFirebaseOnce();
  return _googleProvider;
}

const firebaseClient = {
  isFirebaseAvailable,
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseProvider
};

export default firebaseClient;
