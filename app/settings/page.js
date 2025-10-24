'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user: authUser, signOut } = useAuth();
  const router = useRouter();
  const [currentUser] = useState("@camino");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // If no saved theme, default to light and save it
      setTheme('light');
      localStorage.setItem('theme', 'light');
      applyTheme('light');
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else if (newTheme === 'system') {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
      <div className="w-full max-w-[500px]">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#14532d] dark:hover:text-[#f5f5f5] transition-colors mb-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
      <div className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-4 md:p-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg md:text-xl font-bold text-[#13343b] dark:text-[#f5f5f5] transition-colors">Settings</h1>
        </div>

        {/* User Info Section */}
        <div className="mb-4 md:mb-5 pb-3 md:pb-4 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)]">
          <h2 className="text-[10px] md:text-xs font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-2 uppercase tracking-wide">Profile</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm md:text-base font-semibold text-[#13343b] dark:text-[#f5f5f5]">{authUser ? authUser.username : currentUser}</p>
              <p className="text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">{authUser ? 'Signed in' : 'Demo user'}</p>
            </div>
            {authUser && (
              <button
                onClick={handleSignOut}
                className="px-2 md:px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 bg-[#fffffe] dark:bg-[#262828] text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Theme Section */}
        <div className="mb-4 md:mb-5 pb-3 md:pb-4 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)]">
          <h2 className="text-[10px] md:text-xs font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-2 uppercase tracking-wide">Appearance</h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-[#13343b] dark:text-[#f5f5f5]">Theme</p>
              <p className="text-[10px] md:text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">Choose your preferred theme</p>
            </div>
            <select 
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="px-2 md:px-3 py-1.5 rounded-lg border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] bg-[#fffffe] dark:bg-[#1f2121] text-[#13343b] dark:text-[#f5f5f5] text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#13343b] dark:focus:ring-[#f5f5f5]"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-4 md:mb-5 pb-3 md:pb-4 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)]">
          <h2 className="text-[10px] md:text-xs font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-2 uppercase tracking-wide">Notifications</h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-[#13343b] dark:text-[#f5f5f5]">Daily Reminders</p>
              <p className="text-[10px] md:text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">Get reminded to track your habits</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                notifications 
                  ? 'bg-green-700 dark:bg-green-800' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                notifications ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Data Section */}
        <div>
          <h2 className="text-[10px] md:text-xs font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-2 uppercase tracking-wide">Data</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-2 md:px-3 py-2 rounded-lg border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] bg-[#fffffe] dark:bg-[#262828] text-[#13343b] dark:text-[#f5f5f5] text-xs hover:bg-gray-50 dark:hover:bg-[#1f2121] transition-colors">
              Export Data
            </button>
            <button className="w-full text-left px-2 md:px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-[#fffffe] dark:bg-[#262828] text-red-600 dark:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
