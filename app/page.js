'use client';

import { useState, useEffect } from 'react';
import SocialHabitTracker from "./components/SocialHabitTracker";
import UserProfilePage from "./[username]/page";

export default function Home() {
  const [viewingUsername, setViewingUsername] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Parse hash from URL
    const parseHash = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        // Remove the # and extract username
        const username = hash.substring(1);
        setViewingUsername(username);
      } else {
        setViewingUsername(null);
      }
    };

    // Parse on mount
    parseHash();

    // Listen for hash changes
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Prevent hydration mismatch by rendering nothing until client-side
  if (!isClient) {
    return <SocialHabitTracker />;
  }

  // If viewing a specific user profile via hash
  if (viewingUsername) {
    return <UserProfilePage usernameFromHash={viewingUsername} />;
  }

  // Default: show current month tracker
  return <SocialHabitTracker />;
}
