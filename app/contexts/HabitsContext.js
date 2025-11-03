'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreDb, isFirebaseAvailable } from '../lib/firebase';

const HabitsContext = createContext({});

export const useHabits = () => useContext(HabitsContext);

export function HabitsProvider({ children }) {
  const { user: authUser, loading: authLoading } = useAuth();
  
  // Ref to track if we've loaded from cache to prevent duplicate loads
  const hasLoadedFromCache = useRef(false);
  
  // State for habits by month - format: { "2025-01": ["Habit 1", "Habit 2"], "2025-02": [...], ... }
  const [habitsByMonth, setHabitsByMonth] = useState(() => {
    // Initialize with 1 default habit for each month of 2025
    const defaultHabits = {};
    for (let month = 1; month <= 12; month++) {
      const monthKey = `2025-${month.toString().padStart(2, '0')}`;
      defaultHabits[monthKey] = ['Habit 1'];
    }
    return defaultHabits;
  });
  
  // State for completions - format: { "2025-10-22": ["Habit 1", "Habit 2"], ... }
  const [completions, setCompletions] = useState({});

  // State for productive hours - format: { "2025-10-22": "8", "2025-10-23": "6.5", ... }
  const [productiveHours, setProductiveHours] = useState({});

  // State to track if data has been loaded from Firestore
  const [dataLoaded, setDataLoaded] = useState(false);

  // Immediately load from cache when authUser becomes available
  useEffect(() => {
    if (!authUser || hasLoadedFromCache.current) return;
    
    if (typeof window !== 'undefined') {
      try {
        const savedHabits = localStorage.getItem(`habitsByMonth_${authUser.uid}`);
        const savedCompletions = localStorage.getItem(`userCompletions_${authUser.uid}`);
        const savedHours = localStorage.getItem(`productiveHours_${authUser.uid}`);
        
        if (savedHabits) {
          const habits = JSON.parse(savedHabits);
          setHabitsByMonth(habits);
          console.log('✅ Loaded habits from cache');
        }
        if (savedCompletions) {
          const comps = JSON.parse(savedCompletions);
          setCompletions(comps);
          console.log('✅ Loaded completions from cache');
        }
        if (savedHours) {
          const hours = JSON.parse(savedHours);
          setProductiveHours(hours);
          console.log('✅ Loaded productive hours from cache');
        }
        
        hasLoadedFromCache.current = true;
      } catch (e) {
        console.error('Error loading from cache:', e);
      }
    }
  }, [authUser]);

  // Load habits data from Firestore when user logs in
  useEffect(() => {
    if (authLoading) return;

    const loadHabitsData = async () => {
      if (!authUser || !isFirebaseAvailable()) {
        // Reset to default if logged out
        const defaultHabits = {};
        for (let month = 1; month <= 12; month++) {
          const monthKey = `2025-${month.toString().padStart(2, '0')}`;
          defaultHabits[monthKey] = ['Habit 1'];
        }
        setHabitsByMonth(defaultHabits);
        setCompletions({});
        setProductiveHours({});
        setDataLoaded(true);
        return;
      }

      // Try to load from localStorage first for immediate rendering
      let localHabits = {};
      let localCompletions = {};
      let localHours = {};
      let loadedFromLocalStorage = false;

      if (typeof window !== 'undefined') {
        try {
          const savedHabits = localStorage.getItem(`habitsByMonth_${authUser.uid}`);
          const savedCompletions = localStorage.getItem(`userCompletions_${authUser.uid}`);
          const savedHours = localStorage.getItem(`productiveHours_${authUser.uid}`);
          
          if (savedHabits) {
            localHabits = JSON.parse(savedHabits);
            loadedFromLocalStorage = true;
          }
          if (savedCompletions) {
            localCompletions = JSON.parse(savedCompletions);
          }
          if (savedHours) {
            localHours = JSON.parse(savedHours);
          }

          // If we have localStorage data, set it immediately for fast rendering
          if (loadedFromLocalStorage) {
            setHabitsByMonth(localHabits);
            setCompletions(localCompletions);
            setProductiveHours(localHours);
          }
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
        }
      }

      // Set dataLoaded to true immediately to prevent loading screen
      // (either we have localStorage data, or we'll show defaults)
      setDataLoaded(true);

      // Then load from Firestore in the background to ensure sync
      try {
        const db = getFirestoreDb();
        const userHabitsRef = doc(db, 'userHabits', authUser.uid);
        const docSnap = await getDoc(userHabitsRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const firestoreHabits = data.habitsByMonth || {};
          const firestoreCompletions = data.completions || {};
          const firestoreHours = data.productiveHours || {};

          // Update state with Firestore data (authoritative source)
          setHabitsByMonth(firestoreHabits);
          setCompletions(firestoreCompletions);
          setProductiveHours(firestoreHours);

          // Update localStorage with latest Firestore data
          if (typeof window !== 'undefined') {
            localStorage.setItem(`habitsByMonth_${authUser.uid}`, JSON.stringify(firestoreHabits));
            localStorage.setItem(`userCompletions_${authUser.uid}`, JSON.stringify(firestoreCompletions));
            localStorage.setItem(`productiveHours_${authUser.uid}`, JSON.stringify(firestoreHours));
          }
        } else {
          // No Firestore document exists
          let defaultHabitsForNewUser = {};
          
          if (Object.keys(localHabits).length === 0) {
            // New user - initialize with 1 habit per month
            for (let month = 1; month <= 12; month++) {
              const monthKey = `2025-${month.toString().padStart(2, '0')}`;
              defaultHabitsForNewUser[monthKey] = ['Habit 1'];
            }
          }
          
          const initialData = {
            habitsByMonth: Object.keys(localHabits).length > 0 ? localHabits : defaultHabitsForNewUser,
            completions: localCompletions,
            productiveHours: localHours,
            updatedAt: new Date()
          };
          
          await setDoc(userHabitsRef, initialData);
          setHabitsByMonth(initialData.habitsByMonth);
          setCompletions(initialData.completions);
          setProductiveHours(initialData.productiveHours);

          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(`habitsByMonth_${authUser.uid}`, JSON.stringify(initialData.habitsByMonth));
            localStorage.setItem(`userCompletions_${authUser.uid}`, JSON.stringify(initialData.completions));
            localStorage.setItem(`productiveHours_${authUser.uid}`, JSON.stringify(initialData.productiveHours));
          }
        }
        // Note: dataLoaded is already set to true earlier for instant rendering
      } catch (error) {
        console.error('Error loading habits data from Firestore:', error);
        // dataLoaded is already true, so UI won't be blocked
      }
    };

    loadHabitsData();
  }, [authUser, authLoading]);

  // Save habits data to Firestore whenever it changes (debounced)
  useEffect(() => {
    if (!authUser || !isFirebaseAvailable() || !dataLoaded) return;

    const saveToFirestore = async () => {
      try {
        // Save to localStorage immediately for instant retrieval
        if (typeof window !== 'undefined') {
          localStorage.setItem(`habitsByMonth_${authUser.uid}`, JSON.stringify(habitsByMonth));
          localStorage.setItem(`userCompletions_${authUser.uid}`, JSON.stringify(completions));
          localStorage.setItem(`productiveHours_${authUser.uid}`, JSON.stringify(productiveHours));
          console.log('💾 Saved to localStorage cache');
        }

        // Then save to Firestore (background sync)
        const db = getFirestoreDb();
        const userHabitsRef = doc(db, 'userHabits', authUser.uid);
        
        await updateDoc(userHabitsRef, {
          habitsByMonth,
          completions,
          productiveHours,
          updatedAt: new Date()
        });
        console.log('☁️ Synced to Firestore');
      } catch (error) {
        console.error('Error saving habits data to Firestore:', error);
        // If document doesn't exist, create it
        if (error.code === 'not-found') {
          try {
            const db = getFirestoreDb();
            const userHabitsRef = doc(db, 'userHabits', authUser.uid);
            await setDoc(userHabitsRef, {
              habitsByMonth,
              completions,
              productiveHours,
              updatedAt: new Date()
            });
          } catch (createError) {
            console.error('Error creating habits document:', createError);
          }
        }
      }
    };

    // Debounce the save operation to avoid too many writes
    const timeoutId = setTimeout(saveToFirestore, 500);
    return () => clearTimeout(timeoutId);
  }, [habitsByMonth, completions, productiveHours, authUser, dataLoaded]);

  // Get habits for a specific month
  const getHabitsForMonth = (monthKey) => {
    return habitsByMonth[monthKey] || [];
  };

  // Update habit name for a specific month
  const updateHabitName = (monthKey, index, newName) => {
    if (newName.trim()) {
      const oldName = habitsByMonth[monthKey]?.[index];
      setHabitsByMonth(prev => {
        const newHabits = { ...prev };
        if (!newHabits[monthKey]) {
          newHabits[monthKey] = [];
        }
        newHabits[monthKey] = [...newHabits[monthKey]];
        newHabits[monthKey][index] = newName.trim();
        return newHabits;
      });
      
      // Update completions for this month to reflect the new habit name
      if (oldName) {
        const updatedCompletions = {};
        Object.keys(completions).forEach(date => {
          // Only update dates in the tie month
          if (date.startsWith(monthKey)) {
            updatedCompletions[date] = completions[date].map(habit => 
              habit === oldName ? newName.trim() : habit
            );
          } else {
            updatedCompletions[date] = completions[date];
          }
        });
        setCompletions(updatedCompletions);
      }
    }
  };

  // Add a new habit to a specific month
  const addHabitToMonth = (monthKey) => {
    setHabitsByMonth(prev => {
      const newHabits = { ...prev };
      if (!newHabits[monthKey]) {
        newHabits[monthKey] = [];
      }
      const newHabitNumber = newHabits[monthKey].length + 1;
      newHabits[monthKey] = [...newHabits[monthKey], `Habit ${newHabitNumber}`];
      return newHabits;
    });
  };

  // Delete a habit from a specific month
  const deleteHabitFromMonth = (monthKey, index) => {
    const habitToDelete = habitsByMonth[monthKey]?.[index];
    if (!habitToDelete) return;

    setHabitsByMonth(prev => {
      const newHabits = { ...prev };
      if (newHabits[monthKey]) {
        newHabits[monthKey] = newHabits[monthKey].filter((_, i) => i !== index);
      }
      return newHabits;
    });

    // Remove all completions for this habit in this month
    setCompletions(prev => {
      const updatedCompletions = {};
      Object.keys(prev).forEach(date => {
        if (date.startsWith(monthKey)) {
          // Remove the deleted habit from this date's completions
          updatedCompletions[date] = prev[date].filter(h => h !== habitToDelete);
        } else {
          updatedCompletions[date] = prev[date];
        }
      });
      return updatedCompletions;
    });
  };

  // Toggle habit completion for a specific date
  const toggleCompletion = (date, habit) => {
    setCompletions(prev => {
      const newCompletions = { ...prev };
      if (!newCompletions[date]) {
        newCompletions[date] = [];
      }
      
      const habitIndex = newCompletions[date].indexOf(habit);
      if (habitIndex > -1) {
        // Remove if exists
        newCompletions[date] = newCompletions[date].filter(h => h !== habit);
      } else {
        // Add if doesn't exist
        newCompletions[date] = [...newCompletions[date], habit];
      }
      
      return newCompletions;
    });
  };

  // Check if habit is completed on a date
  const isCompleted = (date, habit) => {
    return completions[date]?.includes(habit) || false;
  };

  // Update productive hours for a specific date
  const updateProductiveHours = (date, value) => {
    setProductiveHours(prev => ({
      ...prev,
      [date]: value
    }));
  };

  // Get productive hours for a specific date
  const getProductiveHours = (date) => {
    return productiveHours[date] || '';
  };

  const value = {
    habitsByMonth,
    getHabitsForMonth,
    updateHabitName,
    addHabitToMonth,
    deleteHabitFromMonth,
    toggleCompletion,
    isCompleted,
    productiveHours,
    updateProductiveHours,
    getProductiveHours,
    dataLoaded,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}
