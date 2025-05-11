// src/components/AuthInitializer.tsx
import React, { useEffect } from 'react';
import { syncAuthState } from '../utils/authUtils';

/**
 * Component that initializes authentication state when the app starts
 * This runs once when the app mounts and syncs the frontend auth state with the backend
 */
const AuthInitializer: React.FC = () => {
  useEffect(() => {
    // Only run this once when the component mounts
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication state...');
        const isAuthenticated = await syncAuthState();
        console.log('Authentication state initialized. Is authenticated:', isAuthenticated);
      } catch (error) {
        console.error('Error initializing authentication state:', error);
      }
    };

    initializeAuth();
  }, []);

  // This component doesn't render anything visible, it just runs the auth initialization
  return null;
};

export default AuthInitializer;
