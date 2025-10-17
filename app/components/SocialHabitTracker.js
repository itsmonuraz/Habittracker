'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// User data stored in memory
const userData = {
  "@alex": {
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
  const [currentUser] = useState("@alex");
  const [viewingUser, setViewingUser] = useState("@alex");
  const [userDataState, setUserDataState] = useState(userData);
  
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
    const completions = userDataState[user].completions[date];
    return completions && completions.includes(habit);
  };

  // Toggle habit completion
  const toggleHabitCompletion = (habit, date) => {
    if (viewingUser !== currentUser) return; // Read-only mode
    if (isFutureDate(date)) return; // Can't toggle future dates

    setUserDataState(prevData => {
      const newData = JSON.parse(JSON.stringify(prevData)); // Deep clone
      const completions = newData[currentUser].completions;

      if (!completions[date]) {
        completions[date] = [];
      }

      const habitIndex = completions[date].indexOf(habit);
      if (habitIndex > -1) {
        completions[date].splice(habitIndex, 1);
      } else {
        completions[date].push(habit);
      }

      return newData;
    });
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

  const isViewingOthers = viewingUser !== currentUser;
  const user = userDataState[viewingUser];

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 relative bg-[#fcfcf9] dark:bg-[#1f2121]">
      <div className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-4 w-full max-w-[1100px] overflow-x-auto">
        <div className="flex justify-between items-center pl-2 pr-2 mb-4">
          <div className="text-sm font-medium text-[#13343b] dark:text-[#f5f5f5]">
            {getCurrentMonthYear()}
          </div>
          <div className="text-sm font-medium text-[#13343b] dark:text-[#f5f5f5]">
            {getCompletionStats().completed}/{getCompletionStats().total}
          </div>
        </div>

        {/* Desktop Table */}
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
                          ${!isDisabled ? 'hover:scale-95 hover:shadow-inner hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                          ${isPast && !isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/10 after:pointer-events-none after:rounded' : ''}
                          ${isPast && isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none after:rounded' : ''}
                        `} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Table - Vertical Layout */}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Navigation - Below Table */}
        <div className="md:hidden mt-6 flex justify-between items-center px-2">
          <Link href="/settings">
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
      <Link href="/settings">
        <div className="hidden md:block fixed bottom-6 left-6 text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium cursor-pointer hover:text-[#13343b] dark:hover:text-[#f5f5f5] transition-colors">
          {currentUser}
        </div>
      </Link>

      <Link href="/community">
        <button 
          className="hidden md:flex fixed top-6 right-6 border-none rounded-lg p-3 font-medium cursor-pointer transition-all duration-250 hover:-translate-y-0.5 items-center justify-center"
        >
          <Image 
            src="/social2.svg" 
            alt="View Others" 
            width={20} 
            height={20}
          />
        </button>
      </Link>
    </div>
  );
}
