'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// User data stored in memory (same as main component)
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
      "2025-10-07": ["5K run", "Practice guitar"],
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

const currentDate = "2025-10-15";
const dateRange = generateDateRange();

export default function CommunityPage() {
  // Format date for display - just return the day number
  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    return day;
  };

  // Check if a habit is completed on a specific date
  const isHabitCompleted = (user, habit, date) => {
    const completions = userData[user].completions[date];
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

  // Get current month and year
  const getCurrentMonthYear = () => {
    const date = new Date(currentDate + 'T00:00:00');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
      {/* Header */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#13343b] dark:text-[#f5f5f5]">Community Habits - {getCurrentMonthYear()}</h1>
          <Link href="/">
            <button className="!text-[#808383] dark:text-[#13343b] border-none rounded-lg py-2 px-4 !font-xs cursor-pointer transition-all duration-250  flex items-center gap-2">
              <span>← Back to My Habits</span>
            </button>
          </Link>
        </div>
      </div>

      {/* All Users' Tables */}
      <div className="w-full max-w-6xl space-y-8">
        {Object.keys(userData).map((userName) => {
          const user = userData[userName];
          
          return (
            <div key={userName} className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-4 w-full overflow-x-auto">
              <h2 className="text-sm text-right font-semibold text-[#13343b] dark:text-[#f5f5f5] mb-4">{userName}</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-max">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold text-xs py-1 px-2 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)] sticky left-0 z-30 min-w-[120px] bg-[#fffffe] dark:bg-[#262828]">
                        Habit
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
                          const isCompleted = isHabitCompleted(userName, habit, date);
                          const isFuture = isFutureDate(date);
                          const isPast = isPastDate(date);
                          const isTodayDate = isToday(date);
                          const cellId = `cell-${userName}-${habitIndex}-${dateIndex}`;
                          
                          return (
                            <td 
                              key={dateIndex}
                              id={cellId}
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
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
