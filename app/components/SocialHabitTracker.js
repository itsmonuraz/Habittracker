'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '../lib/firebase';
import { collection } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useHabits } from '../contexts/HabitsContext';
import LoginModal from './LoginModal';

// User data stored in memory
const userData = {
  "@camino": {
    habits: ["Morning Meditation", "Exercise", "Read 30min", "Drink 8 glasses water", "No social media before 6pm"],
    completions: {
      "2025-10-01": ["Morning Meditation", "Exercise", "Read 30min"],
      "2025-10-02": ["Morning Meditation", "Drink 8 glasses water"],
      "2025-10-03": ["Morning Meditation", "Exercise", "Read 30min", "Drink 8 glasses water"],
      "2025-10-04": ["Morning Meditation", "Read 30min"],
      "2025-10-05": ["Morning Meditation", "Exercise", "Drink 8 glasses water", "No social media before 6pm"],
      "2025-10-06": ["Morning Meditation", "Exercise", "Read 30min"],
      "2025-10-07": ["Morning Meditation"],
      "2025-10-08": ["Morning Meditation", "Exercise", "Read 30min", "Drink 8 glasses water"],
      "2025-10-09": ["Morning Meditation", "Exercise", "Read 30min"],
      "2025-10-10": ["Morning Meditation", "Drink 8 glasses water"],
      "2025-10-11": ["Morning Meditation", "Exercise", "Read 30min", "Drink 8 glasses water"],
      "2025-10-12": ["Morning Meditation", "Read 30min"],
      "2025-10-13": ["Morning Meditation", "Exercise", "Drink 8 glasses water", "No social media before 6pm"],
      "2025-10-14": ["Morning Meditation", "Exercise", "Read 30min"],
      "2025-10-15": ["Morning Meditation"]
    }
  },
  "@jordan": {
    habits: ["5K run", "Practice guitar", "Meal prep", "Call family", "Journal writing"],
    completions: {
      "2025-10-01": ["5K run", "Practice guitar", "Journal writing"],
      "2025-10-02": ["Practice guitar", "Call family", "Journal writing"],
      "2025-10-03": ["5K run", "Practice guitar", "Meal prep"],
      "2025-10-04": ["Practice guitar", "Journal writing"],
      "2025-10-05": ["5K run", "Practice guitar", "Meal prep", "Call family"],
      "2025-10-06": ["Practice guitar", "Journal writing"],
      "2025-10-07": ["5K run", "Practice guitar", "Meal prep"],
      "2025-10-08": ["5K run", "Practice guitar", "Meal prep", "Journal writing"],
      "2025-10-09": ["5K run", "Practice guitar", "Journal writing"],
      "2025-10-10": ["Practice guitar", "Call family", "Journal writing"],
      "2025-10-11": ["5K run", "Practice guitar", "Meal prep"],
      "2025-10-12": ["Practice guitar", "Journal writing"],
      "2025-10-13": ["5K run", "Practice guitar", "Meal prep", "Call family"],
      "2025-10-14": ["Practice guitar", "Journal writing"],
      "2025-10-15": ["5K run", "Practice guitar"]
    }
  },
  "@sam": {
    habits: ["Yoga", "Learn Spanish", "Cook dinner", "Walk dog", "Sleep by 10pm"],
    completions: {
      "2025-10-01": ["Yoga", "Learn Spanish", "Walk dog", "Sleep by 10pm"],
      "2025-10-02": ["Learn Spanish", "Cook dinner", "Walk dog"],
      "2025-10-03": ["Yoga", "Cook dinner", "Walk dog", "Sleep by 10pm"],
      "2025-10-04": ["Learn Spanish", "Walk dog"],
      "2025-10-05": ["Yoga", "Learn Spanish", "Cook dinner", "Walk dog"],
      "2025-10-06": ["Yoga", "Cook dinner", "Sleep by 10pm"],
      "2025-10-07": ["Learn Spanish", "Walk dog"],
      "2025-10-08": ["Yoga", "Learn Spanish", "Cook dinner", "Walk dog", "Sleep by 10pm"],
      "2025-10-09": ["Yoga", "Learn Spanish", "Walk dog", "Sleep by 10pm"],
      "2025-10-10": ["Learn Spanish", "Cook dinner", "Walk dog"],
      "2025-10-11": ["Yoga", "Cook dinner", "Walk dog", "Sleep by 10pm"],
      "2025-10-12": ["Learn Spanish", "Walk dog"],
      "2025-10-13": ["Yoga", "Learn Spanish", "Cook dinner", "Walk dog"],
      "2025-10-14": ["Yoga", "Cook dinner", "Sleep by 10pm"],
      "2025-10-15": ["Learn Spanish", "Walk dog"]
    }
  }
};

// Generate 30 days of dates (October 1-30, 2025)
const generateDateRange = () => {
  const dates = [];
  for (let i = 1; i <= 30; i++) {
    const day = i.toString().padStart(2, '0');
    dates.push(`2025-10-${day}`);
  }
  return dates;
};

// Get current date dynamically
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currentDate = getCurrentDate();
const dateRange = generateDateRange();

// Motivational reminders array
const motivationalReminders = [
  "When you feel unmotivated, don't stop to rest and wait for energy to return. Instead, read articles, review your notes, or watch inspiring videos. These small actions can reignite your motivation and help you get back on track.",
  "The brain gets more dopamine from planning than doing.\nThat's why people have multiple business ideas but zero businesses.",
];

export default function SocialHabitTracker() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { getHabitsForMonth, toggleCompletion, isCompleted: isHabitCompletedInContext, productiveHours, updateProductiveHours, getProductiveHours } = useHabits();
  
  // Get current month for habits
  const currentMonthKey = currentDate.substring(0, 7); // "2025-10"
  
  // Determine the current user - use authUser's username if logged in, otherwise use demo
  const currentUser = authUser?.username || "@camino";
  const [viewingUser, setViewingUser] = useState(currentUser);
  
  // Initialize user data - create empty data for new users
  const [userDataState, setUserDataState] = useState(() => {
    if (authUser && !userData[authUser.username]) {
      // New user - initialize with empty habits
      return {
        ...userData,
        [authUser.username]: {
          habits: [],
          completions: {}
        }
      };
    }
    return userData;
  });
  
  // Update viewing user when authUser changes
  useEffect(() => {
    if (authUser?.username) {
      setViewingUser(authUser.username);
      // Ensure user data exists for the logged-in user
      setUserDataState(prevData => {
        if (!prevData[authUser.username]) {
          return {
            ...prevData,
            [authUser.username]: {
              habits: [],
              completions: {}
            }
          };
        }
        return prevData;
      });
    }
  }, [authUser]);
  
  // Test Firebase connection
  useEffect(() => {
    console.log('🔥 Firebase DB initialized:', db ? 'Success ✅' : 'Failed ❌');
    console.log('🔐 Firebase Auth initialized:', auth ? 'Success ✅' : 'Failed ❌');
    console.log('📊 Firebase Config:', {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    });
    console.log('👤 User:', authUser ? `Logged in as ${authUser.displayName} (${authUser.username})` : 'Not logged in (viewing demo)');
  }, [authUser]);
  
  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  
  // State for current motivational reminder - start with first one to avoid hydration mismatch
  const [currentReminder, setCurrentReminder] = useState(motivationalReminders[0]);
  const [isClient, setIsClient] = useState(false);
  
  // Set random reminder on client mount
  useEffect(() => {
    setIsClient(true);
    const randomIndex = Math.floor(Math.random() * motivationalReminders.length);
    setCurrentReminder(motivationalReminders[randomIndex]);
  }, []);
  
  // Change reminder every 60 seconds
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalReminders.length);
      setCurrentReminder(motivationalReminders[randomIndex]);
    }, 60000); // 60000ms = 1 minute
    
    return () => clearInterval(interval);
  }, [isClient]);

  // Format date for display - just return the day number
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    return day;
  };

  // Check if a habit is completed on a specific date
  const isHabitCompleted = (user, habit, date) => {
    // If viewing own profile (logged in), use shared context
    if (authUser && user === authUser.username) {
      return isHabitCompletedInContext(date, habit);
    }
    // For demo users, use local state
    const completions = userDataState[user]?.completions[date];
    return completions && completions.includes(habit);
  };

  // Toggle habit completion
  const toggleHabitCompletion = (habit, date) => {
    // If not logged in, show login modal
    if (!authUser) {
      setLoginMessage("Sign in to track your own habits and save your progress");
      setShowLoginModal(true);
      return;
    }
    
    if (viewingUser !== currentUser) return; // Read-only mode
    if (isFutureDate(date)) return; // Can't toggle future dates

    // Use shared context for logged-in users
    toggleCompletion(date, habit);
  };

  // Check if date is in the future
  const isFutureDate = (date) => {
    return date > currentDate;
  };

  // Check if date is in the past
  const isPastDate = (date) => {
    return date < currentDate;
  };

  // Check if date is today
  const isToday = (date) => {
    return date === currentDate;
  };

  // Handle productive hours input
  const handleProductiveHoursChange = (date, value) => {
    // If not logged in, show login modal
    if (!authUser) {
      setLoginMessage("Sign in to track your productive hours");
      setShowLoginModal(true);
      return;
    }
    
    if (viewingUser !== currentUser) return; // Read-only mode
    if (isFutureDate(date)) return; // Can't set future dates
    
    // Allow empty input
    if (value === '') {
      updateProductiveHours(date, '');
      return;
    }
    
    // Limit to max 2 decimal places
    const decimalRegex = /^\d*\.?\d{0,2}$/;
    if (!decimalRegex.test(value)) return;
    
    // Validate input: allow decimals for minutes (0-20 hours, .00-.59 for minutes)
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 20) return;
    
    // Check if decimal part (minutes) is valid (0-59)
    const decimalPart = Math.round((numValue % 1) * 100);
    if (decimalPart > 59) return;
    
    updateProductiveHours(date, value);
  };

  const isViewingOthers = viewingUser !== currentUser;
  
  // Use shared habits for logged-in users (current month), demo data for others
  const user = authUser && viewingUser === authUser.username
    ? { habits: getHabitsForMonth(currentMonthKey), completions: {} }
    : (userDataState[viewingUser] || { habits: [], completions: {} });

  // Get current month and year
  const getCurrentMonthYear = () => {
    const date = new Date(currentDate + 'T00:00:00');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Calculate completion stats for passed days only
  const getCompletionStats = () => {
    let totalCompleted = 0;
    let totalPossible = 0;
    
    // Only count days that have passed (up to and including today)
    const passedDates = dateRange.filter(date => date <= currentDate);
    
    passedDates.forEach(date => {
      user.habits.forEach(habit => {
        totalPossible++;
        if (isHabitCompleted(viewingUser, habit, date)) {
          totalCompleted++;
        }
      });
    });
    
    return { completed: totalCompleted, total: totalPossible };
  };

  // Show empty state message if user has no habits
  const showEmptyState = user.habits.length === 0;
  
  // Show helpful message for logged-in users
  const showHabitsPrompt = authUser && user.habits.length > 0 && user.habits.every(h => h.startsWith('Habit '));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative bg-[#fcfcf9] dark:bg-[#1f2121]">
      {/* Sign in prompt for non-logged in users */}
      {!authUser && !authLoading && (
        <div className="mb-4 text-center py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            This is only demo data
          </p>
          <button
            onClick={() => {
              setLoginMessage("Sign in to track your own habits and save your progress");
              setShowLoginModal(true);
            }}
            className="text-sm text-green-700 dark:text-green-400 underline hover:text-green-900 dark:hover:text-green-300 transition-colors cursor-pointer bg-transparent border-none font-semibold"
          >
            Sign in to start tracking your habits
          </button>
        </div>
      )}
      
      <div className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-4 w-full max-w-[1100px] overflow-x-auto">
        <div className="flex justify-between items-center pl-2 pr-2 mb-4">
          <div className="text-sm font-medium text-[#13343b] dark:text-[#f5f5f5]">
            {getCurrentMonthYear()}
          </div>
          <div className="text-sm font-medium text-[#13343b] dark:text-[#f5f5f5]">
            {getCompletionStats().completed}/{getCompletionStats().total}
          </div>
        </div>

        {/* Empty State - Show when user has no habits */}
        {showEmptyState && (
          <div className="py-16 text-center">
            <p className="text-lg text-[#626c71] dark:text-[rgba(167,169,169,0.8)] mb-4">
              Welcome, {authUser?.displayName || 'User'}! 👋
            </p>
            <p className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-6">
              You don&apos;t have any habits yet. Start building your routine!
            </p>
            <p className="text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.6)] italic">
              Coming soon: Add and manage your own habits
            </p>
          </div>
        )}
        
        {/* Prompt to customize habits */}
        {showHabitsPrompt && !showEmptyState && (
          <div className="mb-4 text-center py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-800 dark:text-green-300">
              Click on your <Link href={`/${currentUser.replace('@', '')}`} className="underline font-semibold">username</Link> to customize your habit names
            </p>
          </div>
        )}

        {/* Desktop Table */}
        {!showEmptyState && (
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr>
                <th className="text-left font-semibold text-xs py-1 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] sticky left-0 z-30 min-w-[120px] bg-[#fffffe] dark:bg-[#262828]">
                  
                </th>
                {dateRange.map((date, index) => {
                  const dayNumber = formatDateHeader(date);
                  return (
                    <th key={index} className="text-center text-[10px] text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium py-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] sticky top-0 z-10 bg-[#fffffe] dark:bg-[#262828]">
                      {dayNumber}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {user.habits.map((habit, habitIndex) => (
                <tr key={habitIndex}>
                  <td className="text-left text-xs py-1 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] text-[#13343b] dark:text-[#f5f5f5] sticky left-0 bg-[#fffffe] dark:bg-[#262828] z-20 min-w-[180px] max-w-[150px]">
                    {habit}
                  </td>
                  {dateRange.map((date, dateIndex) => {
                    const isCompleted = isHabitCompleted(viewingUser, habit, date);
                    const isFuture = isFutureDate(date);
                    const isPast = isPastDate(date);
                    const isTodayDate = isToday(date);
                    const isDisabled = isViewingOthers || isFuture || isPast;
                    const cellId = `cell-${viewingUser}-${habitIndex}-${dateIndex}`;
                    
                    return (
                      <td 
                        key={dateIndex}
                        id={cellId}
                        className={`text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] h-[28px] transition-all duration-200 relative
                          ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}
                        `}
                        onClick={() => !isDisabled && toggleHabitCompletion(habit, date)}
                      >
                          <div className={`w-full h-full rounded transition-all duration-200 relative
                            ${isCompleted ? 'bg-green-700 dark:bg-green-800' : isFuture ? 'bg-black/10' : 'bg-transparent'}
                            ${!isDisabled && !isCompleted ? 'hover:scale-95 hover:shadow-inner hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                            ${isPast && !isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/10 after:pointer-events-none after:rounded' : ''}
                            ${isPast && isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none after:rounded' : ''}
                          `} />
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Productive Hours Row */}
              <tr>
                <td className="text-left text-xs py-1 px-2 text-[#13343b] dark:text-[#f5f5f5] sticky left-0 bg-[#fffffe] dark:bg-[#262828] z-20 min-w-[180px] max-w-[150px] font-semibold">
                  {/* Empty cell for row label */}
                </td>
                {dateRange.map((date, dateIndex) => {
                  const isFuture = isFutureDate(date);
                  const isPast = isPastDate(date);
                  const isDisabled = isViewingOthers || isFuture || isPast;
                  const hours = getProductiveHours(date);
                  
                  return (
                    <td 
                      key={dateIndex}
                      className="text-center p-0.5 border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] h-[28px]"
                    >
                      <input
                        type="text"
                        inputMode="decimal"
                        value={hours}
                        onChange={(e) => handleProductiveHoursChange(date, e.target.value)}
                        disabled={isDisabled}
                        placeholder={isFuture ? '' : '0'}
                        className={`w-full h-full text-[10px] text-center border-none bg-transparent outline-none text-[#13343b] dark:text-[#f5f5f5] rounded
                          ${!isDisabled ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-not-allowed'}
                          ${isFuture ? 'bg-black/10' : ''}
                          focus:bg-green-50 dark:focus:bg-green-900/20 focus:ring-1 focus:ring-green-600
                        `}
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        )}

        {/* Mobile Table - Vertical Layout */}
        {!showEmptyState && (
        <div className="overflow-x-auto md:hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left font-semibold text-xs py-2 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] sticky left-0 z-30 bg-[#fffffe] dark:bg-[#262828] min-w-[50px]">
                  Day
                </th>
                {user.habits.map((habit, index) => (
                  <th key={index} className="border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] min-w-[28px] w-7 sticky top-0 z-10 bg-[#fffffe] dark:bg-[#262828] py-2">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-[10px] text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium whitespace-nowrap" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>
                        {habit}
                      </span>
                    </div>
                  </th>
                ))}
                {/* Productive Hours Column Header */}
                <th className="border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] min-w-[28px] w-7 sticky top-0 z-10 bg-[#fffffe] dark:bg-[#262828] py-2">
                  <div className="flex items-center justify-center h-full">
                    <span className="text-[10px] text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium whitespace-nowrap" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>
                      Hrs
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((date, dateIndex) => {
                const dayNumber = formatDateHeader(date);
                return (
                  <tr key={dateIndex}>
                    <td className="text-left text-xs py-1 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] text-[#13343b] dark:text-[#f5f5f5] sticky left-0 bg-[#fffffe] dark:bg-[#262828] z-20 font-medium">
                      {dayNumber}
                    </td>
                    {user.habits.map((habit, habitIndex) => {
                      const isCompleted = isHabitCompleted(viewingUser, habit, date);
                      const isFuture = isFutureDate(date);
                      const isPast = isPastDate(date);
                      const isTodayDate = isToday(date);
                      const isDisabled = isViewingOthers || isFuture || isPast;
                      const cellId = `cell-mobile-${viewingUser}-${dateIndex}-${habitIndex}`;
                      
                      return (
                        <td 
                          key={habitIndex}
                          id={cellId}
                          className={`text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] h-[28px] transition-all duration-200 relative
                            ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}
                          `}
                          onClick={() => !isDisabled && toggleHabitCompletion(habit, date)}
                        >
                          <div className={`w-full h-full rounded transition-all duration-200 relative
                            ${isCompleted ? 'bg-green-700 dark:bg-green-800' : isFuture ? 'bg-black/10' : 'bg-transparent'}
                            ${!isDisabled ? 'hover:scale-95 hover:shadow-inner hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                            ${isPast && !isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/10 after:pointer-events-none after:rounded' : ''}
                            ${isPast && isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none after:rounded' : ''}
                          `} />
                        </td>
                      );
                    })}
                    
                    {/* Productive Hours Cell for Mobile */}
                    <td 
                      className="text-center p-0.5 border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] h-[28px]"
                    >
                      <input
                        type="text"
                        inputMode="decimal"
                        value={getProductiveHours(date)}
                        onChange={(e) => handleProductiveHoursChange(date, e.target.value)}
                        disabled={isViewingOthers || isFutureDate(date) || isPastDate(date)}
                        placeholder={isFutureDate(date) ? '' : '0'}
                        className={`w-full h-full text-[10px] text-center border-none bg-transparent outline-none text-[#13343b] dark:text-[#f5f5f5] rounded
                          ${!(isViewingOthers || isFutureDate(date) || isPastDate(date)) ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-not-allowed'}
                          ${isFutureDate(date) ? 'bg-black/10' : ''}
                          focus:bg-green-50 dark:focus:bg-green-900/20 focus:ring-1 focus:ring-green-600
                        `}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}

        {/* Mobile Navigation - Below Table */}
        <div className="md:hidden mt-6 flex justify-between items-center px-2">
          <Link href={`/${currentUser.replace('@', '')}`}>
            <div className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium cursor-pointer hover:text-[#13343b] dark:hover:text-[#f5f5f5] transition-colors">
              {currentUser}
            </div>
          </Link>

          <Link href="/community">
            <div className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium cursor-pointer hover:text-[#13343b] dark:hover:text-[#f5f5f5] transition-colors">
              Community
            </div>
          </Link>
        </div>
      </div>

      {/* Motivational Reminder - Outside Table Block */}
      <div className="mt-10 text-center max-w-2xl">
        <p className="text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.8)] italic transition-all duration-500 whitespace-pre-line">
          {currentReminder}
        </p>
      </div>

      {/* Desktop Navigation - Fixed Position */}
      <Link href={`/${currentUser.replace('@', '')}`}>
        <div className="hidden md:block fixed bottom-6 left-6 text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium cursor-pointer hover:text-[#13343b] dark:hover:text-[#f5f5f5] transition-colors">
          {currentUser}
        </div>
      </Link>

      <Link href="/community">
        <button 
          className="hidden md:flex fixed top-6 right-6 border-none rounded-lg p-3 font-medium cursor-pointer transition-all duration-250 items-center justify-center"
        >
          <Image 
            src="/social2.svg" 
            alt="View Others" 
            width={20} 
            height={20}
          />
        </button>
      </Link>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginMessage}
      />
    </div>
  );
}
