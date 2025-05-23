// src/pages/AuthCallback.tsx
import React, { useEffect } from 'react';
import axios from 'axios'; // Make sure axios is installed
import { usePlaybackStore } from '../store/playbackStore'; // For token storage
import { refreshAuthState } from '../utils/authUtils'; // Import the auth utility

// This is a bare-bones component that just processes the auth callback
// without any React state to minimize the chance of rendering loops
const AuthCallback: React.FC = () => {
  useEffect(() => {
    // This runs exactly once when the component mounts
    // We're basically just doing a "script" here without React state
    const processAuthCallback = async () => {
      console.log('AUTH CALLBACK PROCESSING...');
      
      // Get URL parameters from the window location
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');
      const codeVerifier = window.sessionStorage.getItem('spotify_code_verifier');
      
      // Only check for processed code if we've had a successful exchange before
      // We don't want to block legitimate retries after failed attempts
      // Check if we're already processing this code (for race condition prevention)
      const processingCode = window.sessionStorage.getItem('spotify_processing_code') || null;
      const processedCode = window.sessionStorage.getItem('spotify_processed_code') || null;
      const hasSuccessfulAuth = localStorage.getItem('trap-tally-playback-storage');
      
      // Case 1: Code is currently being processed (prevent duplicate requests)
      if (processingCode === code) {
        console.log('Auth code is already being processed. Preventing duplicate request.');
        // Stay on this page and let the original request finish
        return;
      }
      
      // Case 2: Code was already successfully processed
      if (hasSuccessfulAuth && processedCode === code) {
        console.log('This authorization code has already been processed and we have stored tokens, redirecting to artists.');
        window.location.href = '/artists';
        return;
      }
      
      // Mark this code as being processed (set before any async operations)
      // Make sure code isn't null before setting it
      if (code) {
        window.sessionStorage.setItem('spotify_processing_code', code);
      }

      // Handle error cases
      if (error) {
        console.error(`Auth Error from Spotify redirect: ${error}`);
        window.sessionStorage.removeItem('spotify_code_verifier');
        window.location.href = '/?error=' + encodeURIComponent(`Spotify login failed: ${error}`);
        return;
      }

      if (!code) {
        console.error('No code found in URL');
        window.sessionStorage.removeItem('spotify_code_verifier');
        window.location.href = '/?error=' + encodeURIComponent('Spotify login failed: Missing authorization code');
        return;
      }

      if (!codeVerifier) {
        console.error('No code verifier found in session storage');
        window.location.href = '/?error=' + encodeURIComponent('Spotify login failed: Missing code verifier');
        return;
      }

      // Exchange code for token
      try {        
        console.log('Exchanging code for token...');
        console.log('Debug - Code length:', code.length);
        console.log('Debug - Code verifier length:', codeVerifier.length);
        console.log('Debug - Redirect URI:', import.meta.env.VITE_REDIRECT_URI);
        
        // Make the token exchange request with timeout and verbose logging
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/token`,
          {
            code,
            code_verifier: codeVerifier,
            redirect_uri: import.meta.env.VITE_REDIRECT_URI,
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000, // 10 second timeout
          }
        );

        console.log('Token exchange response received:', response.status);
        console.log('Response data structure:', Object.keys(response.data).join(', '));
        
        // Set tokens in localStorage directly for simplicity
        if (response.data && response.data.access_token) {
          console.log('Access token received, length:', response.data.access_token.length);
          console.log('Refresh token received:', !!response.data.refresh_token);
          
          // *** IMPORTANT: First mark the code as processed - this MUST happen before we modify the store
          // to ensure we don't get into a loop where code is reused
          window.sessionStorage.setItem('spotify_processed_code', code);
          
          try {
            // Use the Zustand store directly to ensure it updates right away
            const { setSpotifyTokens } = usePlaybackStore.getState();
            
            // Update the store directly
            setSpotifyTokens({
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token,
              expiresIn: response.data.expires_in,
            });
            
            console.log('Authentication successful! Tokens stored in Zustand store.');

          } catch (storeError) {
            console.error('Error updating Zustand store:', storeError);
            
            // Fallback: Store tokens in localStorage directly in Zustand format
            console.log('Falling back to direct localStorage manipulation');
            const storeData = {
              state: {
                spotifyUserTokens: {
                  accessToken: response.data.access_token,
                  refreshToken: response.data.refresh_token,
                  expiresIn: response.data.expires_in,
                  receivedAt: Date.now()
                },
                deviceId: null,
                isPlaying: false,
                currentTrackId: null
              },
              version: 0
            };
            
            try {
              // Store directly in localStorage
              localStorage.setItem('trap-tally-playback-storage', JSON.stringify(storeData));
              console.log('Tokens saved directly to localStorage');
            } catch (lsError) {
              console.error('Failed to save to localStorage:', lsError);
              alert('Authentication succeeded but failed to save tokens. Please try again.');
            }
          }
          
          // Clean up
          window.sessionStorage.removeItem('spotify_code_verifier');
          window.sessionStorage.removeItem('spotify_processing_code'); // Clear the processing flag
          console.log('Authentication successful! Refreshing auth state and redirecting...');
          
          // Notify other components about successful authentication
          try {
            // First try to refresh auth state to sync UI with backend
            await refreshAuthState();
            console.log('Auth state refreshed after successful token exchange');
          } catch (refreshErr) {
            console.error('Error refreshing auth state:', refreshErr);
          }
          
          // Redirect to artists page with timestamp to ensure fresh load
          window.location.href = '/artists?auth=success&t=' + Date.now();
        } else {
          console.error('Missing access_token in response:', response.data);
          throw new Error('Invalid response from server - no access token');
        }
      } catch (err) {
        console.error('Error exchanging code for token:', err);
        let errorMessage = 'Login failed: An unexpected error occurred';
        
        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
          });
          
          if (err.response) {
            errorMessage = `Login failed: ${err.response.data?.message || err.message} (${err.response.status})`;
          } else if (err.request) {
            // Request was made but no response received
            errorMessage = 'Login failed: No response received from server';
          }
        } else if (err instanceof Error) {
          errorMessage = `Login failed: ${err.message}`;
        }
        
        // Don't mark the code as processed - this allows legitimate retries
        
        // Show alert so the error is more visible
        // Only show alert if this isn't a common issue with duplicate code exchange
        if (!errorMessage.includes('Invalid authorization code')) {
          alert('Spotify authentication error: ' + errorMessage);
        }
        
        // Clean up the code verifier to ensure a fresh start next time
        window.sessionStorage.removeItem('spotify_code_verifier');
        window.sessionStorage.removeItem('spotify_processing_code'); // Clear the processing flag on error
        
        // Redirect with error
        window.location.href = '/?error=' + encodeURIComponent(errorMessage);
      }
    };

    // Run the callback processor
    processAuthCallback();
  }, []); // Empty dependency array - run once on mount
  
  // Just show a loading message
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-center">
      <h1 className="text-2xl font-bold mb-4 text-white">Processing login...</h1>
      <div className="text-gray-400">Please wait while we complete your Spotify login</div>
    </div>
  );
};

export default AuthCallback;