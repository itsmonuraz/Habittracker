'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// User data stored in memory with habits per month
const userData = {
  "@camino": {
    habitsByMonth: {
      "2025-01": ["Morning Meditation", "Exercise", "Read 30min"],
      "2025-02": ["Morning Meditation", "Exercise", "Drink 8 glasses water"],
      "2025-03": ["Morning Meditation", "Read 30min", "No social media before 6pm"],
      "2025-04": ["Morning Meditation", "Exercise", "Read 30min", "Drink 8 glasses water"],
      "2025-05": ["Morning Meditation", "Exercise", "Yoga"],
      "2025-06": ["Morning Meditation", "Swim", "Read 30min"],
      "2025-07": ["Morning Meditation", "Exercise", "Read 30min", "Drink 8 glasses water"],
      "2025-08": ["Morning Meditation", "Exercise", "Meditate"],
      "2025-09": ["Morning Meditation", "Run", "Read 30min"],
      "2025-10": ["Morning Meditation", "Exercise", "Read 30min", "Drink 8 glasses water", "No social media before 6pm"],
      "2025-11": ["Morning Meditation", "Exercise", "Read 30min"],
      "2025-12": ["Morning Meditation", "Exercise", "Reflect"]
    },
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
  }
};

// Generate date range for entire year (365 days)
const generateYearDateRange = (year = 2025) => {
  const dates = [];
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Check for leap year
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    monthDays[1] = 29;
  }
  
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= monthDays[month - 1]; day++) {
      const monthStr = month.toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      dates.push(`${year}-${monthStr}-${dayStr}`);
    }
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

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username ? `@${params.username}` : "@camino";
  const [productiveHours, setProductiveHours] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dateRange = generateYearDateRange(2025);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };
  
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    return day;
  };

  const getMonthName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[date.getMonth()];
  };

  const datesByMonth = {};
  dateRange.forEach(date => {
    const month = date.substring(0, 7);
    if (!datesByMonth[month]) {
      datesByMonth[month] = [];
    }
    datesByMonth[month].push(date);
  });

  const isHabitCompleted = (habit, date) => {
    const completions = userData[username]?.completions[date];
    return completions && completions.includes(habit);
  };

  const isFutureDate = (date) => {
    return date > currentDate;
  };

  const isPastDate = (date) => {
    return date < currentDate;
  };

  const isToday = (date) => {
    return date === currentDate;
  };

  const getHabitsForMonth = (monthKey) => {
    return userData[username]?.habitsByMonth[monthKey] || [];
  };

  const getYearCompletionStats = () => {
    let totalCompleted = 0;
    let totalPossible = 0;
    
    const passedDates = dateRange.filter(date => date <= currentDate);
    
    passedDates.forEach(date => {
      const monthKey = date.substring(0, 7);
      const monthHabits = getHabitsForMonth(monthKey);
      monthHabits.forEach(habit => {
        totalPossible++;
        if (isHabitCompleted(habit, date)) {
          totalCompleted++;
        }
      });
    });
    
    return { completed: totalCompleted, total: totalPossible };
  };

  // Check if user exists
  if (!userData[username]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#13343b] dark:text-[#f5f5f5] mb-4">User not found</h1>
          <Link href="/">
            <button className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] cursor-pointer transition-colors">
              Go back home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const user = userData[username];
  const stats = getYearCompletionStats();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
      {/* Header */}
      <div className="w-full max-w-[1400px] mb-1 md:mb-2">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link href="/">
            <h1 className="text-lg md:text-2xl font-bold text-[#13343b] dark:text-[#6f7171] hover:text-[#14532d] dark:hover:text-[#9a9a9a]  transition-colors cursor-pointer">
              {username}
            </h1>
          </Link>
          <div className="text-sm font-medium text-[#13343b] dark:text-[#6f7171]">
            {stats.completed}/{stats.total}
          </div>
        </div>
      </div>

      {/* Year View - Single Table for All Months */}
      <div className="w-full max-w-[1400px]">
        <div className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-4 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#13343b] dark:text-[#f5f5f5]">
              Full Year 2025
            </h2>
          </div>
          
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="text-center font-semibold text-xs py-2 px-2 border-b-2 border-[rgba(94,82,64,0.2)] dark:border-[rgba(119,124,124,0.3)] sticky left-0 z-30 w-[50px] min-w-[50px] bg-[#fffffe] dark:bg-[#262828]">
                    Month
                  </th>
                  <th className="text-left font-semibold text-xs py-2 px-3 border-b-2 border-[rgba(94,82,64,0.2)] dark:border-[rgba(119,124,124,0.3)] sticky left-[50px] z-30 min-w-[150px] bg-[#fffffe] dark:bg-[#262828]">
                    Habit
                  </th>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="text-center text-[10px] text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium py-2 border-b-2 border-[rgba(94,82,64,0.2)] dark:border-[rgba(119,124,124,0.3)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] sticky top-0 z-10 bg-[#fffffe] dark:bg-[#262828]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(datesByMonth).map((monthKey, monthIndex) => {
                  const monthDates = datesByMonth[monthKey];
                  const monthName = getMonthName(monthDates[0]);
                  const monthHabits = getHabitsForMonth(monthKey);
                  const daysInMonth = monthDates.length;
                  
                  return [
                    ...monthHabits.map((habit, habitIndex) => (
                      <tr key={`${monthKey}-${habitIndex}`} className={habitIndex === 0 ? 'border-t-2 border-t-[rgba(94,82,64,0.2)] dark:border-t-[rgba(119,124,124,0.3)]' : ''}>
                        {habitIndex === 0 ? (
                          <td 
                            rowSpan={monthHabits.length + 1}
                            className="text-center border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r-2 border-r-[rgba(94,82,64,0.2)] dark:border-r-[rgba(119,124,124,0.3)] text-[#13343b] dark:text-[#f5f5f5] sticky left-0 bg-[#fffffe] dark:bg-[#262828] z-20 w-[50px] min-w-[50px] p-2"
                          >
                            <div className="flex items-center justify-center h-full">
                              <span className="text-xs font-semibold whitespace-nowrap" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>
                                {monthName}
                              </span>
                            </div>
                          </td>
                        ) : null}
                        <td className="text-left text-xs py-1 px-3 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] text-[#13343b] dark:text-[#f5f5f5] sticky left-[50px] bg-[#fffffe] dark:bg-[#262828] z-20 min-w-[150px]">
                          {habit}
                        </td>
                        {Array.from({ length: 31 }, (_, dayIndex) => {
                          const day = dayIndex + 1;
                          if (day > daysInMonth) {
                            return (
                              <td 
                                key={dayIndex}
                                className="text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px] bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(0,0,0,0.2)]"
                              />
                            );
                          }
                          
                          const date = monthDates[dayIndex];
                          const isCompleted = isHabitCompleted(habit, date);
                          const isFuture = isFutureDate(date);
                          const isPast = isPastDate(date);
                          
                          return (
                            <td 
                              key={dayIndex}
                              className="text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px] transition-all duration-200 relative"
                            >
                              <div className={`w-full h-full rounded transition-all duration-200 relative
                                ${isCompleted ? 'bg-green-700 dark:bg-green-800' : isFuture ? 'bg-black/10' : 'bg-transparent'}
                                ${isPast && !isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/10 after:pointer-events-none after:rounded' : ''}
                                ${isPast && isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none after:rounded' : ''}
                              `} />
                            </td>
                          );
                        })}
                      </tr>
                    )),
                    // Productive Hours Row for this month
                    <tr key={`${monthKey}-hours`}>
                      <td className="text-left text-xs py-1 px-3 border-b-2 border-b-[rgba(94,82,64,0.2)] dark:border-b-[rgba(119,124,124,0.3)] text-[#13343b] dark:text-[#f5f5f5] sticky left-[50px] bg-[#fffffe] dark:bg-[#262828] z-20 min-w-[150px] font-semibold">
                        {/* Empty cell for hours row */}
                      </td>
                      {Array.from({ length: 31 }, (_, dayIndex) => {
                        const day = dayIndex + 1;
                        if (day > daysInMonth) {
                          return (
                            <td 
                              key={dayIndex}
                              className="text-center p-0.5 border-b-2 border-b-[rgba(94,82,64,0.2)] dark:border-b-[rgba(119,124,124,0.3)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px] bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(0,0,0,0.2)]"
                            />
                          );
                        }
                        
                        const date = monthDates[dayIndex];
                        const isFuture = isFutureDate(date);
                        const isPast = isPastDate(date);
                        const hours = productiveHours[date] || '';
                        
                        return (
                          <td 
                            key={dayIndex}
                            className="text-center p-0.5 border-b-2 border-b-[rgba(94,82,64,0.2)] dark:border-b-[rgba(119,124,124,0.3)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px]"
                          >
                            <input
                              type="text"
                              inputMode="decimal"
                              value={hours}
                              disabled={true}
                              placeholder={isFuture ? '' : '0'}
                              className={`w-full h-full text-[10px] text-center border-none bg-transparent outline-none text-[#13343b] dark:text-[#f5f5f5] rounded cursor-not-allowed
                                ${isFuture ? 'bg-black/10' : ''}
                              `}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ];
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Table - Vertical Layout */}
          <div className="overflow-x-auto md:hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-center font-semibold text-xs py-2 px-1 border-b-2 border-[rgba(94,82,64,0.2)] dark:border-[rgba(119,124,124,0.3)] sticky left-0 z-30 bg-[#fffffe] dark:bg-[#262828] w-[40px] min-w-[40px]">
                    M
                  </th>
                  <th className="text-left font-semibold text-xs py-2 px-2 border-b-2 border-[rgba(94,82,64,0.2)] dark:border-[rgba(119,124,124,0.3)] sticky left-[40px] z-30 bg-[#fffffe] dark:bg-[#262828] min-w-[80px]">
                    Habit
                  </th>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <th key={day} className="border-b-2 border-[rgba(94,82,64,0.2)] dark:border-[rgba(119,124,124,0.3)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] min-w-[28px] w-7 sticky top-0 z-10 bg-[#fffffe] dark:bg-[#262828] py-2">
                      <div className="flex items-center justify-center h-full">
                        <span className="text-[10px] text-[#626c71] dark:text-[rgba(167,169,169,0.7)] font-medium whitespace-nowrap" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>
                          {day}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(datesByMonth).map((monthKey) => {
                  const monthDates = datesByMonth[monthKey];
                  const monthName = getMonthName(monthDates[0]);
                  const monthHabits = getHabitsForMonth(monthKey);
                  const daysInMonth = monthDates.length;
                  
                  return [
                    ...monthHabits.map((habit, habitIndex) => (
                      <tr key={`${monthKey}-${habitIndex}`} className={habitIndex === 0 ? 'border-t-2 border-t-[rgba(94,82,64,0.2)] dark:border-t-[rgba(119,124,124,0.3)]' : ''}>
                        {habitIndex === 0 ? (
                          <td 
                            rowSpan={monthHabits.length + 1}
                            className="text-center border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r-2 border-r-[rgba(94,82,64,0.2)] dark:border-r-[rgba(119,124,124,0.3)] text-[#13343b] dark:text-[#f5f5f5] sticky left-0 bg-[#fffffe] dark:bg-[#262828] z-20 w-[40px] min-w-[40px] p-1"
                          >
                            <div className="flex items-center justify-center h-full">
                              <span className="text-[10px] font-semibold whitespace-nowrap" style={{writingMode: 'vertical-rl', textOrientation: 'mixed'}}>
                                {monthName}
                              </span>
                            </div>
                          </td>
                        ) : null}
                        <td className="text-left text-[10px] py-1 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] text-[#13343b] dark:text-[#f5f5f5] sticky left-[40px] bg-[#fffffe] dark:bg-[#262828] z-20 min-w-[80px] truncate">
                          {habit}
                        </td>
                        {Array.from({ length: 31 }, (_, dayIndex) => {
                          const day = dayIndex + 1;
                          if (day > daysInMonth) {
                            return (
                              <td 
                                key={dayIndex}
                                className="text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px] bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(0,0,0,0.2)]"
                              />
                            );
                          }
                          
                          const date = monthDates[dayIndex];
                          const isCompleted = isHabitCompleted(habit, date);
                          const isFuture = isFutureDate(date);
                          const isPast = isPastDate(date);
                          
                          return (
                            <td 
                              key={dayIndex}
                              className="text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px] transition-all duration-200 relative"
                            >
                              <div className={`w-full h-full rounded transition-all duration-200 relative
                                ${isCompleted ? 'bg-green-700 dark:bg-green-800' : isFuture ? 'bg-black/10' : 'bg-transparent'}
                                ${isPast && !isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/10 after:pointer-events-none after:rounded' : ''}
                                ${isPast && isCompleted ? 'after:content-[""] after:absolute after:inset-0 after:bg-black/20 after:pointer-events-none after:rounded' : ''}
                              `} />
                            </td>
                          );
                        })}
                      </tr>
                    )),
                    // Productive Hours Row for this month
                    <tr key={`${monthKey}-hours`}>
                      <td className="text-left text-[10px] py-1 px-2 border-b-2 border-b-[rgba(94,82,64,0.2)] dark:border-b-[rgba(119,124,124,0.3)] text-[#13343b] dark:text-[#f5f5f5] sticky left-[40px] bg-[#fffffe] dark:bg-[#262828] z-20 min-w-[80px] font-semibold">
                        {/* Empty cell for hours row */}
                      </td>
                      {Array.from({ length: 31 }, (_, dayIndex) => {
                        const day = dayIndex + 1;
                        if (day > daysInMonth) {
                          return (
                            <td 
                              key={dayIndex}
                              className="text-center p-0.5 border-b-2 border-b-[rgba(94,82,64,0.2)] dark:border-b-[rgba(119,124,124,0.3)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px] bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(0,0,0,0.2)]"
                            />
                          );
                        }
                        
                        const date = monthDates[dayIndex];
                        const isFuture = isFutureDate(date);
                        const isPast = isPastDate(date);
                        const hours = productiveHours[date] || '';
                        
                        return (
                          <td 
                            key={dayIndex}
                            className="text-center p-0.5 border-b-2 border-b-[rgba(94,82,64,0.2)] dark:border-b-[rgba(119,124,124,0.3)] border-r border-r-[rgba(94,82,64,0.08)] dark:border-r-[rgba(119,124,124,0.1)] w-7 min-w-[28px] h-[28px]"
                          >
                            <input
                              type="text"
                              inputMode="decimal"
                              value={hours}
                              disabled={true}
                              placeholder={isFuture ? '' : '0'}
                              className={`w-full h-full text-[10px] text-center border-none bg-transparent outline-none text-[#13343b] dark:text-[#f5f5f5] rounded cursor-not-allowed
                                ${isFuture ? 'bg-black/10' : ''}
                              `}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Settings and Screenshot Links - Below Table */}
      <div className="w-full max-w-[1400px] mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings" className="inline-flex items-center">
            <button className="text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] cursor-pointer transition-colors leading-none align-baseline">
              Settings
            </button>
          </Link>
          <Link href="/about" className="inline-flex items-center">
            <button className="text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] cursor-pointer transition-colors leading-none align-baseline">
              About
            </button>
          </Link>
          <button 
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert('Link copied to clipboard!');
            }}
            className="text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] cursor-pointer transition-colors leading-none align-baseline"
          >
            Share
          </button>
        </div>
        <button 
          onClick={toggleTheme}
          className="text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] cursor-pointer transition-colors leading-none align-baseline"
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  );
}
