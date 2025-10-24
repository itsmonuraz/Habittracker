'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';

export default function NotFound() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // If user is logged in, redirect to home (which shows their habits)
      // Otherwise, just stay on 404
      if (user) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#fcfcf9] dark:bg-[#1f2121]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#13343b] dark:text-[#f5f5f5] mb-4">
          Page not found
        </h1>
        <p className="text-sm text-[#626c71] dark:text-[rgba(167,169,169,0.7)] mb-6">
          {loading ? 'Loading...' : user ? 'Redirecting to your profile...' : 'The page you\'re looking for doesn\'t exist.'}
        </p>
        <Link 
          href="/"
          className="text-sm text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 underline"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
