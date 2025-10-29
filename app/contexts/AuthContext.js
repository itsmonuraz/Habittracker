'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseProvider, getFirestoreDb, isFirebaseAvailable } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage to prevent flicker
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('authUser');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('authUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('authUser');
      }
    }
  }, [user]);

  useEffect(() => {
    // Listen for auth state changes (client-only)
    if (!isFirebaseAvailable()) {
      // No firebase on client (rare) - treat as logged out demo mode
      setLoading(false);
      return;
    }

    const firebaseAuth = getFirebaseAuth();

    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          const firestoreDb = getFirestoreDb();
          const userDocRef = doc(firestoreDb, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Create new user document on first sign-in
            const username = `@${firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || firebaseUser.email.split('@')[0]}`;
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              username: username,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              username: username
            });
          } else {
            // Update last login
            await setDoc(userDocRef, {
              lastLogin: serverTimestamp()
            }, { merge: true });

            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              username: userData.username
            });
          }
        } catch (err) {
          console.error('Error with user data:', err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if username is available
  const checkUsernameAvailability = async (username) => {
    try {
      const firestoreDb = getFirestoreDb();
      // Convert to lowercase before checking
      const usernameToCheck = username.toLowerCase().startsWith('@') 
        ? username.toLowerCase() 
        : `@${username.toLowerCase()}`;
      const usersRef = collection(firestoreDb, 'users');
      const q = query(usersRef, where('username', '==', usernameToCheck));
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty; // true if available, false if taken
    } catch (err) {
      console.error('Error checking username:', err);
      throw err;
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (uid, email, displayName, username) => {
    const firestoreDb = getFirestoreDb();
    // Convert username to lowercase and add @ if needed
    const usernameWithAt = username.toLowerCase().startsWith('@') 
      ? username.toLowerCase() 
      : `@${username.toLowerCase()}`;
    const userDocRef = doc(firestoreDb, 'users', uid);
    await setDoc(userDocRef, {
      uid,
      email,
      displayName: displayName || username,
      username: usernameWithAt,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    return usernameWithAt;
  };

  // Sign up with email and password
  const signUpWithEmail = async (email, password, username, displayName) => {
    try {
      // Check username availability first
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }

      // Create auth user
      const firebaseAuth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName || username
      });

      // Create Firestore profile
      await createUserProfile(userCredential.user.uid, email, displayName || username, username);

      return userCredential.user;
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    try {
      const firebaseAuth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return userCredential.user;
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  // Sign in with Google (with custom username option)
  const signInWithGoogle = async (customUsername = null) => {
    try {
      const firebaseAuth = getFirebaseAuth();
      const provider = getFirebaseProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      
      // If custom username provided, update it
      if (customUsername) {
        const isAvailable = await checkUsernameAvailability(customUsername);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }
        
        const firestoreDb = getFirestoreDb();
        const userDocRef = doc(firestoreDb, 'users', result.user.uid);
        const usernameWithAt = customUsername.startsWith('@') ? customUsername : `@${customUsername}`;
        await setDoc(userDocRef, {
          username: usernameWithAt
        }, { merge: true });
      }
      
      return result.user;
    } catch (err) {
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup - this is not really an error, just cancelled
        console.log('Sign-in popup was closed by user');
        return null; // Return null instead of throwing
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Multiple popups attempted - only one can be shown at a time
        console.log('Another popup is already open');
        return null;
      }
      
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const firebaseAuth = getFirebaseAuth();
      await firebaseSignOut(firebaseAuth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Update username
  const updateUsername = async (newUsername) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Convert to lowercase and add @ if needed
      const usernameWithAt = newUsername.toLowerCase().startsWith('@') 
        ? newUsername.toLowerCase() 
        : `@${newUsername.toLowerCase()}`;
      const firestoreDb = getFirestoreDb();
      const userDocRef = doc(firestoreDb, 'users', user.uid);
      
      await setDoc(userDocRef, {
        username: usernameWithAt
      }, { merge: true });

      // Update local user state
      const updatedUser = { ...user, username: usernameWithAt };
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      console.error('Error updating username:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    checkUsernameAvailability,
    updateUsername,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
