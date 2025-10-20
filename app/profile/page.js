'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function ProfilePage() {
  const [currentUser] = useState("@camino");
  const [productiveHours, setProductiveHours] = useState({});
  const dateRange = generateYearDateRange(2025);
  
  // Format date for display - just return the day number
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    return day;
  };

  // Get month name from date
  const getMonthName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[date.getMonth()];
  };

  // Group dates by month
  const datesByMonth = {};
  dateRange.forEach(date => {
    const month = date.substring(0, 7); // Get YYYY-MM
    if (!datesByMonth[month]) {
      datesByMonth[month] = [];
    }
    datesByMonth[month].push(date);
  });

  // Check if a habit is completed on a specific date
  const isHabitCompleted = (habit, date) => {
    const completions = userData[currentUser].completions[date];
    return completions && completions.includes(habit);
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

  // Calculate completion stats for the year
  const getYearCompletionStats = () => {
    let totalCompleted = 0;
    let totalPossible = 0;
    
    const passedDates = dateRange.filter(date => date <= currentDate);
    
    passedDates.forEach(date => {
      userData[currentUser].habits.forEach(habit => {
        totalPossible++;
        if (isHabitCompleted(habit, date)) {
          totalCompleted++;
        }
      });
    });
    
    return { completed: totalCompleted, total: totalPossible };
  };

  const user = userData[currentUser];
  const stats = getYearCompletionStats();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
      {/* Header */}
      <div className="w-full max-w-[1400px] mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link href="/">
            <h1 className="text-lg md:text-2xl font-bold text-[#13343b] dark:text-[#f5f5f5] hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
              {currentUser}
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-[#13343b] dark:text-[#f5f5f5]">
              {stats.completed}/{stats.total}
            </div>
            <Link href="/settings">
              <button className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] cursor-pointer transition-colors">
                Settings
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Year View - All Months Stacked in One Box */}
      <div className="w-full max-w-[1400px]">
        <div className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-4 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[#13343b] dark:text-[#f5f5f5]">
              Full Year 2025
            </h2>
          </div>
          
          <div className="space-y-8">
            {Object.keys(datesByMonth).map((monthKey) => {
              const monthDates = datesByMonth[monthKey];
              const monthName = getMonthName(monthDates[0]);
              
              return (
                <div key={monthKey} className="w-full overflow-x-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-[#13343b] dark:text-[#f5f5f5]">
                      {monthName}
                    </h3>
                  </div>

              {/* Desktop Table */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full border-collapse min-w-max">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold text-xs py-1 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] sticky left-0 z-30 min-w-[120px] bg-[#fffffe] dark:bg-[#262828]">
                        Habit
                      </th>
                      {monthDates.map((date, index) => {
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
                        {monthDates.map((date, dateIndex) => {
                          const isCompleted = isHabitCompleted(habit, date);
                          const isFuture = isFutureDate(date);
                          const isPast = isPastDate(date);
                          
                          return (
                            <td 
                              key={dateIndex}
                              className={`text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] h-[28px] transition-all duration-200 relative`}
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
                    ))}

                    {/* Productive Hours Row */}
                    <tr>
                      <td className="text-left text-xs py-1 px-2 text-[#13343b] dark:text-[#f5f5f5] sticky left-0 bg-[#fffffe] dark:bg-[#262828] z-20 min-w-[180px] max-w-[150px] font-semibold">
                        {/* Empty cell for row label */}
                      </td>
                      {monthDates.map((date, dateIndex) => {
                        const isFuture = isFutureDate(date);
                        const isPast = isPastDate(date);
                        const hours = productiveHours[date] || '';
                        
                        return (
                          <td 
                            key={dateIndex}
                            className="text-center p-0.5 border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] h-[28px]"
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
                {monthDates.map((date, dateIndex) => {
                  const dayNumber = formatDateHeader(date);
                  return (
                    <tr key={dateIndex}>
                      <td className="text-left text-xs py-1 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] text-[#13343b] dark:text-[#f5f5f5] sticky left-0 bg-[#fffffe] dark:bg-[#262828] z-20 font-medium">
                        {dayNumber}
                      </td>
                      {user.habits.map((habit, habitIndex) => {
                        const isCompleted = isHabitCompleted(habit, date);
                        const isFuture = isFutureDate(date);
                        const isPast = isPastDate(date);
                        
                        return (
                          <td 
                            key={habitIndex}
                            className={`text-center p-1 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] border-r border-r-[rgba(94,82,64,0.12)] dark:border-r-[rgba(119,124,124,0.15)] w-7 min-w-[28px] h-[28px] transition-all duration-200 relative`}
                          >
                            <div className={`w-full h-full rounded transition-all duration-200 relative
                              ${isCompleted ? 'bg-green-700 dark:bg-green-800' : isFuture ? 'bg-black/10' : 'bg-transparent'}
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
                          value={productiveHours[date] || ''}
                          disabled={true}
                          placeholder={isFutureDate(date) ? '' : '0'}
                          className={`w-full h-full text-[10px] text-center border-none bg-transparent outline-none text-[#13343b] dark:text-[#f5f5f5] rounded cursor-not-allowed
                            ${isFutureDate(date) ? 'bg-black/10' : ''}
                          `}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })}
          </div>
        </div>
      </div>
    </div>
  );
}
