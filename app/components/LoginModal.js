'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal({ isOpen, onClose, message }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, checkUsernameAvailability } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI state: 'initial', 'username', 'signup', 'login'
  const [screen, setScreen] = useState('initial');
  
  // Form data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setScreen('initial');
      setUsername('');
      setEmail('');
      setPassword('');
      setDisplayName('');
      setError('');
      setUsernameAvailable(null);
    }
  }, [isOpen]);

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const available = await checkUsernameAvailability(username);
        setUsernameAvailable(available);
      } catch (err) {
        console.error('Error checking username:', err);
      }
      setUsernameChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle(username || null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!usernameAvailable) {
      setError('Please choose an available username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await signUpWithEmail(email, password, username, displayName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sign up');
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const renderInitialScreen = () => (
    <>
      <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '16px', textAlign: 'center' }}>
        Sign In Required
      </h2>
      
      <p style={{ color: '#aaa', fontSize: '16px', marginBottom: '24px', textAlign: 'center', lineHeight: '1.5' }}>
        {message || "Sign in to track your own habits and sync across devices"}
      </p>

      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        style={{
          width: '100%', padding: '14px', backgroundColor: '#4285f4', color: '#fff',
          border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '12px', transition: 'all 0.2s', opacity: isLoading ? 0.7 : 1, marginBottom: '12px'
        }}
        onMouseOver={(e) => !isLoading && (e.target.style.backgroundColor = '#357ae8')}
        onMouseOut={(e) => !isLoading && (e.target.style.backgroundColor = '#4285f4')}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
          <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
        <span style={{ padding: '0 12px', color: '#666', fontSize: '14px' }}>or</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
      </div>

      <button
        onClick={() => setScreen('username')}
        style={{
          width: '100%', padding: '14px', backgroundColor: '#2a2a2a', color: '#fff',
          border: '1px solid #444', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
          cursor: 'pointer', transition: 'all 0.2s', marginBottom: '12px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#2a2a2a'}
      >
        Sign up with Email
      </button>

      <button
        onClick={() => setScreen('login')}
        style={{
          width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#aaa',
          border: '1px solid #333', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseOver={(e) => { e.target.style.backgroundColor = '#2a2a2a'; e.target.style.color = '#fff'; }}
        onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#aaa'; }}
      >
        Already have an account? Sign in
      </button>

      <button onClick={onClose} style={{
        width: '100%', marginTop: '12px', padding: '12px', backgroundColor: 'transparent',
        color: '#666', border: 'none', fontSize: '12px', cursor: 'pointer'
      }}>
        Continue as guest
      </button>
    </>
  );

  const renderUsernameScreen = () => (
    <>
      <button onClick={() => setScreen('initial')} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer', marginBottom: '16px' }}>
        ← Back
      </button>
      
      <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>
        Choose Your Username
      </h2>
      
      <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
        This will be your public handle (e.g., @camino)
      </p>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
          style={{
            width: '100%', padding: '14px', backgroundColor: '#2a2a2a', color: '#fff',
            border: `2px solid ${usernameAvailable === true ? '#34A853' : usernameAvailable === false ? '#EA4335' : '#444'}`,
            borderRadius: '8px', fontSize: '16px', outline: 'none'
          }}
          autoFocus
        />
        {usernameChecking && (
          <p style={{ color: '#aaa', fontSize: '12px', marginTop: '8px' }}>Checking availability...</p>
        )}
        {usernameAvailable === true && (
          <p style={{ color: '#34A853', fontSize: '12px', marginTop: '8px' }}>✓ @{username} is available!</p>
        )}
        {usernameAvailable === false && (
          <p style={{ color: '#EA4335', fontSize: '12px', marginTop: '8px' }}>✗ @{username} is already taken</p>
        )}
      </div>

      <button
        onClick={() => setScreen('signup')}
        disabled={!usernameAvailable || username.length < 3}
        style={{
          width: '100%', padding: '14px', backgroundColor: usernameAvailable ? '#34A853' : '#444',
          color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
          cursor: usernameAvailable ? 'pointer' : 'not-allowed', opacity: usernameAvailable ? 1 : 0.5
        }}
      >
        Continue
      </button>
    </>
  );

  const renderSignupScreen = () => (
    <>
      <button onClick={() => setScreen('username')} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer', marginBottom: '16px' }}>
        ← Back
      </button>
      
      <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>
        Complete Your Profile
      </h2>
      
      <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
        Username: @{username}
      </p>

      <form onSubmit={handleEmailSignUp}>
        <input
          type="text"
          placeholder="Display Name (optional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{
            width: '100%', padding: '14px', backgroundColor: '#2a2a2a', color: '#fff',
            border: '2px solid #444', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none'
          }}
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%', padding: '14px', backgroundColor: '#2a2a2a', color: '#fff',
            border: '2px solid #444', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none'
          }}
        />
        
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{
            width: '100%', padding: '14px', backgroundColor: '#2a2a2a', color: '#fff',
            border: '2px solid #444', borderRadius: '8px', fontSize: '16px', marginBottom: '16px', outline: 'none'
          }}
        />

        {error && <p style={{ color: '#EA4335', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '14px', backgroundColor: '#34A853', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </>
  );

  const renderLoginScreen = () => (
    <>
      <button onClick={() => setScreen('initial')} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '20px', cursor: 'pointer', marginBottom: '16px' }}>
        ← Back
      </button>
      
      <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>
        Welcome Back
      </h2>

      <form onSubmit={handleEmailSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%', padding: '14px', backgroundColor: '#2a2a2a', color: '#fff',
            border: '2px solid #444', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none'
          }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%', padding: '14px', backgroundColor: '#2a2a2a', color: '#fff',
            border: '2px solid #444', borderRadius: '8px', fontSize: '16px', marginBottom: '16px', outline: 'none'
          }}
        />

        {error && <p style={{ color: '#EA4335', fontSize: '14px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%', padding: '14px', backgroundColor: '#4285f4', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p style={{ color: '#666', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}>
        Don&apos;t have an account?{' '}
        <span onClick={() => setScreen('username')} style={{ color: '#4285f4', cursor: 'pointer', textDecoration: 'underline' }}>
          Sign up
        </span>
      </p>
    </>
  );

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '40px',
          maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          border: '1px solid #333', maxHeight: '90vh', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {screen === 'initial' && renderInitialScreen()}
        {screen === 'username' && renderUsernameScreen()}
        {screen === 'signup' && renderSignupScreen()}
        {screen === 'login' && renderLoginScreen()}
      </div>
    </div>
  );
}
