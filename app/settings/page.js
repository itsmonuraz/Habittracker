'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [currentUser] = useState("@alex");
  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
      <div className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-8 w-full max-w-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#13343b] dark:text-[#f5f5f5]">Settings</h1>
          <Link href="/">
            <button className=" text-xs text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] transition-colors">
             back →
            </button>
          </Link>
        </div>

        {/* User Info Section */}
        <div className="mb-8 pb-6 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)]">
          <h2 className="text-sm font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-3 uppercase tracking-wide">Profile</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-[#13343b] dark:text-[#f5f5f5]">{currentUser}</p>
              <p className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">Active user</p>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="mb-8 pb-6 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)]">
          <h2 className="text-sm font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-3 uppercase tracking-wide">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-[#13343b] dark:text-[#f5f5f5]">Theme</p>
              <p className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">Choose your preferred theme</p>
            </div>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] bg-[#fffffe] dark:bg-[#1f2121] text-[#13343b] dark:text-[#f5f5f5] text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#13343b] dark:focus:ring-[#f5f5f5]"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-8 pb-6 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)]">
          <h2 className="text-sm font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-3 uppercase tracking-wide">Notifications</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-[#13343b] dark:text-[#f5f5f5]">Daily Reminders</p>
              <p className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">Get reminded to track your habits</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications 
                  ? 'bg-green-700 dark:bg-green-800' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Data Section */}
        <div>
          <h2 className="text-sm font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-3 uppercase tracking-wide">Data</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-lg border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] bg-[#fffffe] dark:bg-[#262828] text-[#13343b] dark:text-[#f5f5f5] text-sm hover:bg-gray-50 dark:hover:bg-[#1f2121] transition-colors">
              Export Data
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border border-red-200 dark:border-red-900 bg-[#fffffe] dark:bg-[#262828] text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
