// src/components/SpotifyAuthButton.tsx
import React from 'react';
import { usePlaybackStore, selectIsUserAuthenticated } from '../store/playbackStore';
import { useNavigate } from 'react-router-dom';

// --- PKCE Helper Functions ---
// Generates a random string for the code verifier
function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Hashes the code verifier using SHA256 (required for PKCE)
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  // Convert ArrayBuffer to Base64 string, replacing URL-unsafe characters
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
// --- End PKCE Helper Functions ---

/**
 * Button to initiate Spotify login for playback authorization.
 * Uses Authorization Code Flow with PKCE.
 */
const SpotifyAuthButton: React.FC = () => {
  const isAuthenticated = usePlaybackStore(selectIsUserAuthenticated);
  const clearTokens = usePlaybackStore((state) => state.clearSpotifyTokens);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;

    console.log("--- Spotify Auth Button (PKCE) ---");
    console.log("VITE_SPOTIFY_CLIENT_ID:", clientId);
    console.log("VITE_REDIRECT_URI:", redirectUri);

    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      // Add the app-remote-control scope which includes web-playback capabilities
      'app-remote-control',
    ];

    if (!clientId || !redirectUri) {
      console.error("Spotify Client ID or Redirect URI missing.");
      alert("Spotify configuration is missing.");
      return;
    }

    // --- PKCE Generation ---
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    window.sessionStorage.setItem('spotify_code_verifier', codeVerifier);
    console.log("Stored code_verifier in sessionStorage.");
    // -----------------------

    // --- Construct Auth URL (PKCE) ---
    const baseUrl = 'https://accounts.spotify.com/authorize';
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: scopes.join(' '),
        redirect_uri: redirectUri,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
    });
    const finalUrl = `${baseUrl}?${params.toString()}`;
    // --------------------------------

    try {
        console.log("Attempting redirect...");
        window.location.href = finalUrl;
    } catch (error) {
        console.error("Error during redirect:", error);
        alert("Could not redirect to Spotify.");
    }
  };

  const handleLogout = () => {
    console.log("--- Spotify Logout --- ");
    clearTokens();
    navigate('/');
    console.log("Tokens cleared, user logged out.");
  };

  const baseStyle = "flex h-10 items-center justify-center px-6 py-2 rounded-full text-sm font-medium tracking-[0.1px] transition-colors";
  const loginStyle = `${baseStyle} bg-spotify-green text-black`;
  const logoutStyle = `${baseStyle} bg-transparent text-white hover:bg-white/10 border border-white/10`;

  return (
    <button
      onClick={isAuthenticated ? handleLogout : handleLogin}
      className={isAuthenticated ? logoutStyle : loginStyle}
    >
      {isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
};

export default SpotifyAuthButton;
