// src/pages/AuthDiagnostic.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePlaybackStore } from '../store/playbackStore';

// This is a diagnostic component to help troubleshoot auth issues
const AuthDiagnostic: React.FC = () => {
  const spotifyTokens = usePlaybackStore((state) => state.spotifyUserTokens);
  const setSpotifyTokens = usePlaybackStore((state) => state.setSpotifyTokens);
  const clearSpotifyTokens = usePlaybackStore((state) => state.clearSpotifyTokens);
  
  const [manualCode, setManualCode] = useState('');
  const [manualVerifier, setManualVerifier] = useState('');
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [localStorageContent, setLocalStorageContent] = useState<string>('');
  
  // Load localStorage content on init
  useEffect(() => {
    try {
      const content = localStorage.getItem('trap-tally-playback-storage');
      setLocalStorageContent(content || 'Not found');
    } catch (e) {
      setLocalStorageContent(`Error reading localStorage: ${e}`);
    }
  }, []);

  // Function to manually exchange code for token
  const exchangeToken = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/token`,
        {
          code: manualCode,
          code_verifier: manualVerifier,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      setBackendResponse(response.data);
      
      if (response.data && response.data.access_token) {
        // Store tokens in Zustand
        setSpotifyTokens({
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
        });
        alert('Tokens were set successfully!');
      }
    } catch (error) {
      console.error('Manual token exchange failed:', error);
      setBackendResponse({ error: 'Failed to exchange token. See console for details.' });
    }
  };
  
  // Function to manually clear tokens
  const clearTokens = () => {
    clearSpotifyTokens();
    localStorage.removeItem('trap-tally-playback-storage');
    alert('Tokens cleared!');
    window.location.reload();
  };
  
  // Function to refresh localStorage display
  const refreshLocalStorage = () => {
    try {
      const content = localStorage.getItem('trap-tally-playback-storage');
      setLocalStorageContent(content || 'Not found');
    } catch (e) {
      setLocalStorageContent(`Error reading localStorage: ${e}`);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4 text-white">Authentication Diagnostic</h1>
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2 text-white">Current Authentication State</h2>
        <div className="bg-gray-900 p-3 rounded text-white overflow-auto max-h-40">
          <pre>{JSON.stringify(spotifyTokens, null, 2) || 'No tokens found in Zustand store'}</pre>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2 text-white">LocalStorage Content</h2>
        <div className="bg-gray-900 p-3 rounded text-white overflow-auto max-h-40">
          <pre>{localStorageContent}</pre>
        </div>
        <button 
          onClick={refreshLocalStorage}
          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2 text-white">Manual Token Exchange</h2>
        <div className="flex flex-col space-y-2">
          <input 
            type="text" 
            placeholder="Enter authorization code"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="p-2 bg-gray-900 text-white rounded"
          />
          <input 
            type="text" 
            placeholder="Enter code verifier"
            value={manualVerifier}
            onChange={(e) => setManualVerifier(e.target.value)}
            className="p-2 bg-gray-900 text-white rounded"
          />
          <button 
            onClick={exchangeToken}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            Exchange Token
          </button>
        </div>
      </div>
      
      {backendResponse && (
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2 text-white">Backend Response</h2>
          <div className="bg-gray-900 p-3 rounded text-white overflow-auto max-h-40">
            <pre>{JSON.stringify(backendResponse, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2 text-white">Actions</h2>
        <div className="flex flex-col space-y-2">
          <button 
            onClick={clearTokens}
            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
          >
            Clear All Tokens
          </button>
          <button 
            onClick={() => window.location.href = '/artists'}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Go to Artists Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDiagnostic;
