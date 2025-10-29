'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user: authUser, signOut, checkUsernameAvailability, updateUsername } = useAuth();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(authUser?.username || "@camino");
  const [editUsername, setEditUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
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

  // Validate username
  const validateUsername = (username) => {
    if (!username) {
      return 'Username cannot be empty';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return 'Username can only contain lowercase letters, numbers, and underscores';
    }
    return null;
  };

  // Handle username input change with auto-lowercase and availability check
  const handleUsernameChange = async (value) => {
    // Convert to lowercase
    const lowercaseValue = value.toLowerCase();
    setEditUsername(lowercaseValue);
    setUsernameError('');
    setUsernameSuccess('');

    // Validate format first
    const validationError = validateUsername(lowercaseValue);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    // Check if it's the same as current username
    if (`@${lowercaseValue}` === currentUser) {
      setUsernameError('This is already your username');
      return;
    }

    // Check availability
    if (lowercaseValue.length >= 3) {
      setIsCheckingAvailability(true);
      try {
        const isAvailable = await checkUsernameAvailability(lowercaseValue);
        if (!isAvailable) {
          setUsernameError('Username is already taken');
        } else {
          setUsernameSuccess('Username is available!');
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setIsCheckingAvailability(false);
      }
    }
  };

  // Handle username edit start
  const handleEditStart = () => {
    const usernameWithoutAt = currentUser.replace('@', '');
    setEditUsername(usernameWithoutAt);
    setUsernameError('');
    setUsernameSuccess('');
    setIsEditing(true);
  };

  // Handle username edit cancel
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditUsername('');
    setUsernameError('');
    setUsernameSuccess('');
  };

  // Handle username save
  const handleUsernameSave = async () => {
    // Validate username
    const validationError = validateUsername(editUsername);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    // Check if username is the same
    if (`@${editUsername}` === currentUser) {
      setUsernameError('This is already your username');
      return;
    }

    setIsSaving(true);
    setUsernameError('');
    setUsernameSuccess('');

    try {
      // Double-check availability before saving
      const isAvailable = await checkUsernameAvailability(editUsername);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
        setIsSaving(false);
        return;
      }

      // Update username in Firestore (will be converted to lowercase in AuthContext)
      if (authUser) {
        await updateUsername(editUsername);

        const newUsername = `@${editUsername.toLowerCase()}`;
        setCurrentUser(newUsername);
        setUsernameSuccess('Username updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setUsernameSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setUsernameError('Failed to update username. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
      <div className="w-full max-w-[600px]">
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#13343b] dark:text-[#f5f5f5] transition-colors">Settings</h1>
        </div>

        {/* User Info Section */}
        <div className="mb-4 md:mb-5 pb-3 md:pb-4 border-b border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.15)]">
          <h2 className="text-sm md:text-base font-semibold text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-2 uppercase tracking-wide">Profile</h2>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-[#13343b] dark:text-[#f5f5f5]">@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="flex-1 px-3 py-2 text-base border border-[rgba(94,82,64,0.15)] dark:border-[rgba(119,124,124,0.2)] rounded-lg bg-transparent text-[#13343b] dark:text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#13343b] dark:focus:ring-[#f5f5f5] transition-all lowercase"
                      placeholder="username"
                      disabled={isSaving || isCheckingAvailability}
                    />
                    {isCheckingAvailability && (
                      <svg className="animate-spin h-5 w-5 text-[#13343b] dark:text-[#f5f5f5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{usernameError}</p>
                  )}
                  {usernameSuccess && (
                    <p className="text-sm text-green-600 dark:text-green-400">{usernameSuccess}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUsernameSave}
                      disabled={isSaving || !editUsername || isCheckingAvailability || usernameError}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-[#13343b] dark:bg-[#f5f5f5] text-white dark:text-[#13343b] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      disabled={isSaving}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] text-[#13343b] dark:text-[#f5f5f5] hover:bg-gray-50 dark:hover:bg-[#1f2121] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-medium text-[#13343b] dark:text-[#f5f5f5]">{currentUser}</p>
                    {authUser && (
                      <button
                        onClick={handleEditStart}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#626c71] dark:text-[rgba(167,169,169,0.7)] hover:text-[#13343b] dark:hover:text-[#f5f5f5] hover:bg-gray-100 dark:hover:bg-[#1f2121] rounded transition-all"
                        title="Edit username"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mt-1">{authUser ? 'Signed in' : 'Demo user'}</p>
                  {usernameSuccess && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">{usernameSuccess}</p>
                  )}
                </div>
              )}
            </div>
            {authUser && !isEditing && (
              <button
                onClick={handleSignOut}
                className="px-3 md:px-4 py-2 rounded-lg border border-red-200 dark:border-red-900 bg-[#fffffe] dark:bg-[#262828] text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
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
              <p className="text-base md:text-lg font-medium text-[#13343b] dark:text-[#f5f5f5]">Theme</p>
              <p className="text-sm md:text-base text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">Choose your preferred theme</p>
            </div>
            <select 
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              className="px-3 md:px-4 py-2 rounded-lg border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] bg-[#fffffe] dark:bg-[#1f2121] text-[#13343b] dark:text-[#f5f5f5] text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#13343b] dark:focus:ring-[#f5f5f5]"
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
              <p className="text-base md:text-lg font-medium text-[#13343b] dark:text-[#f5f5f5]">Daily Reminders</p>
              <p className="text-sm md:text-base text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">Get reminded to track your habits</p>
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
            <button className="w-full text-left px-3 md:px-4 py-2.5 rounded-lg border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] bg-[#fffffe] dark:bg-[#262828] text-[#13343b] dark:text-[#f5f5f5] text-base hover:bg-gray-50 dark:hover:bg-[#1f2121] transition-colors">
              Export Data
            </button>
            <button className="w-full text-left px-3 md:px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900 bg-[#fffffe] dark:bg-[#262828] text-red-600 dark:text-red-400 text-base hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              Clear All Data
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
