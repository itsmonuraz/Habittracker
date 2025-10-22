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
import { auth, googleProvider, db } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
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
      const usernameToCheck = username.startsWith('@') ? username : `@${username}`;
      const usersRef = collection(db, 'users');
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
    const usernameWithAt = username.startsWith('@') ? username : `@${username}`;
    const userDocRef = doc(db, 'users', uid);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  // Sign in with Google (with custom username option)
  const signInWithGoogle = async (customUsername = null) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // If custom username provided, update it
      if (customUsername) {
        const isAvailable = await checkUsernameAvailability(customUsername);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }
        
        const userDocRef = doc(db, 'users', result.user.uid);
        const usernameWithAt = customUsername.startsWith('@') ? customUsername : `@${customUsername}`;
        await setDoc(userDocRef, {
          username: usernameWithAt
        }, { merge: true });
      }
      
      return result.user;
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    checkUsernameAvailability,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
