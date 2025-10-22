'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">

      {/* About Content */}
      <div className="w-full max-w-[800px]">
        <div className="bg-[#fffffe] dark:bg-[#262828] rounded-xl border border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)] shadow-md p-8">
          <Link href="/">
          <h2 className="text-[#14532d] text-2xl md:text-3xl font-bold dark:text-[#f5f5f5] mb-6">
            About Camino
          </h2>
          </Link>
          <div className="space-y-6 text-[#626c71] dark:text-[rgba(167,169,169,0.7)]">
            <p className="text-base leading-relaxed">
             Camino is nothing but a Habit Tracker, designed to be minialistic and straight to the point.
            <br/>
            <br/>
             You can tick your completed habits within the same day. Passed days or future days cannot be modified,
             ensuring that your habit tracking remains accurate and honest.
            <br/>
            <br/>
            You can view your yearly habits progress data in the
           <Link href="/username" className="text-[#14532d] dark:text-[#9a9a9a] hover:underline">/username</Link> page.
            <br/>
            <br/>
            To ensure a sync across devices, Camino uses your Google account for authentication.
            You can <Link href="/" className="text-[#14532d] dark:text-[#9a9a9a] hover:underline">sign up</Link> using your Google account, create a username, and start tracking your habits seamlessly across multiple devices.
            <br/>
            <br/>
            If you have any questions, suggestions, or feedback, feel free to reach out to me at {' '}
           <a href="mailto:caminotracker@gmail.com" className="text-[#14532d] dark:text-[#9a9a9a] hover:underline">caminotracker@gmail.com</a>.

            </p>

            <div className="pt-4 border-t border-[rgba(94,82,64,0.12)] dark:border-[rgba(119,124,124,0.2)]">
              <p className="text-sm">
               
                <a 
                  href="https://github.com/rknastenka" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#14532d] dark:text-[#9a9a9a] hover:underline font-medium"
                >
                  @rknastenka
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}
