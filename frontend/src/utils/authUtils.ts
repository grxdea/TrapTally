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
    const status = await checkAuthStatus();
    
    // Get Zustand store access
    const { spotifyUserTokens, setSpotifyTokens, clearSpotifyTokens } = usePlaybackStore.getState();
    
    // Only update store if there's a mismatch
    if (status.authenticated && !spotifyUserTokens) {
      // Check if the backend provided a real access token
      if (status.tokenInfo?.accessToken) {
        console.log('Backend has valid tokens. Setting real access token for playback functionality.');
        setSpotifyTokens({
          accessToken: status.tokenInfo.accessToken,
          expiresIn: 3600, // Assuming 1 hour validity, could add expiration time to the response
        });
      } else {
        console.log('Backend has valid tokens but did not provide access token. Setting dummy token for authentication state only.');
        // Fallback to dummy token if backend doesn't provide a real one
        setSpotifyTokens({
          accessToken: 'backend-managed-token', // Using a placeholder token
          expiresIn: 3600, // 1 hour placeholder
        });
      }
      return true;
    } else if (!status.authenticated && spotifyUserTokens) {
      console.log('Backend has no valid tokens but frontend thinks user is authenticated. Clearing frontend state.');
      clearSpotifyTokens();
      return false;
    }
    
    return status.authenticated;
  } catch (error) {
    console.error('Error syncing authentication state:', error);
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
