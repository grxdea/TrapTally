// src/utils/authUtils.ts
import axios from 'axios';
import { usePlaybackStore } from '../store/playbackStore';

/**
 * Interface for authentication status response from backend
 */
interface AuthStatusResponse {
  authenticated: boolean;
  tokenInfo?: {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    tokenType: string;
    accessToken?: string; // Add the access token field
  };
}

/**
 * Check authentication status with the backend
 * @returns Promise with authentication status
 */
export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/auth/status`
    );
    return response.data;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return { authenticated: false };
  }
};

/**
 * Sync frontend store with backend auth state
 * Call this when app initializes or when authentication status might have changed
 */
export const syncAuthState = async (): Promise<boolean> => {
  try {
    const status = await checkAuthStatus(); // status from backend /auth/status (curator's status)
    const { spotifyUserTokens, clearSpotifyTokens } = usePlaybackStore.getState();

    if (!status.authenticated) {
      // If the backend (curator) is not authenticated, any existing frontend user tokens
      // might be invalid or for a session that's no longer recognized by the backend.
      // It's safer to clear them to force a fresh user login if playback is desired.
      if (spotifyUserTokens) {
        console.log('Backend (curator) is not authenticated. Clearing frontend user tokens.');
        clearSpotifyTokens();
      }
      return false; // Overall auth state is false
    } else {
      // Backend (curator) IS authenticated.
      // We DO NOT set spotifyUserTokens here with the curator's token.
      // spotifyUserTokens should only be set by the user's PKCE login flow (AuthCallback.tsx).
      // If spotifyUserTokens is already set (by user login), we leave it as is.
      // If spotifyUserTokens is not set, the user simply hasn't logged in for playback yet.
      console.log('Backend (curator) is authenticated. Frontend user token state remains unchanged by this sync.');
      // The return value here indicates the curator's auth status.
      // The presence of spotifyUserTokens indicates the user's playback auth status.
      return true; // Curator is authenticated
    }
  } catch (error) {
    console.error('Error syncing authentication state:', error);
    // On error, assume curator is not authenticated and clear user tokens if present.
    const { spotifyUserTokens, clearSpotifyTokens } = usePlaybackStore.getState();
    if (spotifyUserTokens) {
        console.warn('Error syncing auth state. Clearing potentially stale frontend user tokens.');
        clearSpotifyTokens();
    }
    return false;
  }
};

/**
 * Force authentication status check and update UI accordingly
 * Call this after login redirects or when login status might have changed
 */
export const refreshAuthState = async (): Promise<void> => {
  const isAuthenticated = await syncAuthState();
  console.log('Auth state refreshed. Authenticated:', isAuthenticated);
  
  // Force React components to re-render if needed
  // This could be enhanced with a custom event or other methods if needed
  window.dispatchEvent(new Event('auth-state-change'));
};
