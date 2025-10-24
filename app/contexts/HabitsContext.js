'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const HabitsContext = createContext({});

export const useHabits = () => useContext(HabitsContext);

export function HabitsProvider({ children }) {
  const { user: authUser } = useAuth();
  
  // State for habits by month - format: { "2025-01": ["Habit 1", "Habit 2"], "2025-02": [...], ... }
  const [habitsByMonth, setHabitsByMonth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('habitsByMonth');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved habits:', e);
        }
      }
    }
    // Initialize with 5 default habits for each month of 2025
    const defaultHabits = {};
    for (let month = 1; month <= 12; month++) {
      const monthKey = `2025-${month.toString().padStart(2, '0')}`;
      defaultHabits[monthKey] = Array.from({ length: 5 }, (_, i) => `Habit ${i + 1}`);
    }
    return defaultHabits;
  });
  
  // State for completions - format: { "2025-10-22": ["Habit 1", "Habit 2"], ... }
  const [completions, setCompletions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCompletions');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved completions:', e);
        }
      }
    }
    return {};
  });

  // State for productive hours - format: { "2025-10-22": "8", "2025-10-23": "6.5", ... }
  const [productiveHours, setProductiveHours] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productiveHours');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved productive hours:', e);
        }
      }
    }
    return {};
  });

  // Save to localStorage whenever habits change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitsByMonth', JSON.stringify(habitsByMonth));
    }
  }, [habitsByMonth]);

  // Save to localStorage whenever completions change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCompletions', JSON.stringify(completions));
    }
  }, [completions]);

  // Save to localStorage whenever productive hours change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('productiveHours', JSON.stringify(productiveHours));
    }
  }, [productiveHours]);

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
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}
