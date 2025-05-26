// src/components/TrackRow.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ApiPlaylistSong } from '../services/playlist.service';
import { usePlaybackStore } from '../store/playbackStore';

interface TrackRowProps {
  track: ApiPlaylistSong;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track }) => {
  // Local state for tracking if we're attempting to reconnect the player
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);
  const MAX_RECONNECTION_ATTEMPTS = 3;

  // Get token and device ID from store
  const setIsPlaying = usePlaybackStore(state => state.setIsPlaying);
  const setCurrentTrackId = usePlaybackStore(state => state.setCurrentTrackId);
  const setDeviceId = usePlaybackStore(state => state.setDeviceId);
  const setSpotifyPlayerReady = usePlaybackStore(state => state.setSpotifyPlayerReady);

  // Wait for Spotify player to be ready with device ID
  const waitForSpotifyPlayer = async (maxWaitMs = 10000, checkIntervalMs = 500, maxRetries = 15): Promise<boolean> => {
    console.log('TrackRow: Waiting for Spotify player to initialize...');
    const startTime = Date.now();
    let retryCount = 0;

    // Check if we already have what we need
    const initialCheck = usePlaybackStore.getState();
    if (initialCheck.deviceId && initialCheck.spotifyUserTokens?.accessToken) {
      console.log('TrackRow: Spotify player already initialized with device ID:', initialCheck.deviceId);
      return true;
    }

    return new Promise((resolve) => {
      const checkForPlayer = () => {
        // Safety check - if we've reached max retries, exit
        if (retryCount >= maxRetries) {
          console.warn(`TrackRow: Max retries (${maxRetries}) reached when waiting for Spotify player. Giving up.`);
          resolve(false);
          return;
        }
        retryCount++;

        const store = usePlaybackStore.getState();
        const hasToken = !!store.spotifyUserTokens?.accessToken;
        const hasDevice = !!store.deviceId;
        const elapsedMs = Date.now() - startTime;

        console.log(`TrackRow: Checking player status - Token: ${hasToken}, Device: ${hasDevice}, Elapsed: ${elapsedMs}ms (Attempt ${retryCount}/${maxRetries})`);

        if (hasToken && hasDevice) {
          console.log('TrackRow: Spotify player successfully initialized!');
          resolve(true);
          return;
        }

        if (elapsedMs >= maxWaitMs) {
          console.warn(`TrackRow: Timed out waiting for Spotify player after ${maxWaitMs}ms`);
          resolve(false);
          return;
        }

        // Check again after interval
        setTimeout(checkForPlayer, checkIntervalMs);
      };

      // Start checking
      checkForPlayer();
    });
  };

  // Check if token is valid - accepting both real Spotify tokens and placeholder tokens
  const isTokenValid = (token: string | undefined | null): boolean => {
    if (!token) {
      return false;
    }
    
    // Special case: if the token is our placeholder token from authUtils, consider it valid
    if (token === 'backend-managed-token') {
      console.log('TrackRow: Detected placeholder token, considering it valid');
      return true;
    }
    
    // For real Spotify tokens, they should be fairly long strings
    if (token.length > 20) {
      return true;
    }
    
    console.error('TrackRow: Token validation failed, token appears invalid');
    return false;
  };

  // Reset reconnection attempts periodically
  useEffect(() => {
    if (reconnectionAttempts > 0) {
      // Reset the counter after 5 minutes
      const resetTimer = setTimeout(() => {
        setReconnectionAttempts(0);
      }, 300000); // 5 minutes

      return () => clearTimeout(resetTimer);
    }
  }, [reconnectionAttempts]);

  // Handle reconnection when device is not found
  const handleDeviceNotFound = async () => {
    console.log('TrackRow: Device not found, attempting to reconnect Spotify player...');
    // Prevent multiple simultaneous reconnection attempts
    if (isReconnecting) {
      console.log('TrackRow: Already reconnecting, skipping duplicate attempt');
      return null;
    }

    // Track reconnection attempts
    setReconnectionAttempts(prev => prev + 1);

    // If we've exceeded max reconnection attempts, suggest page refresh
    if (reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
      console.error(`TrackRow: Exceeded maximum reconnection attempts (${MAX_RECONNECTION_ATTEMPTS})`);
      setError('Unable to reconnect to Spotify after multiple attempts. Please refresh the page.');
      return null;
    }

    // Clear the current error message if any
    setError(null);
    setIsReconnecting(true);

    try {
      // Reset device state in the store
      setDeviceId(null);
      setSpotifyPlayerReady(false);

      // Calculate backoff time based on attempt count (exponential backoff)
      const backoffTime = Math.min(2000 * Math.pow(1.5, reconnectionAttempts - 1), 8000);
      console.log(`TrackRow: Waiting ${backoffTime}ms before reconnection attempt ${reconnectionAttempts}`);

      // Wait a short time before checking for a new device ID
      // This gives the SpotifyPlayer component time to detect the reset and reinitialize
      await new Promise(resolve => setTimeout(resolve, backoffTime));

      // Try to get a new device ID with more retries for more reliability
      const reconnected = await waitForSpotifyPlayer(12000, 800, 15); // 12 second timeout, 0.8s interval, max 15 retries

      if (reconnected) {
        // Get the updated device ID
        const { deviceId: newDeviceId, spotifyUserTokens } = usePlaybackStore.getState();

        if (newDeviceId && isTokenValid(spotifyUserTokens?.accessToken)) {
          console.log('TrackRow: Successfully reconnected Spotify player with device ID:', newDeviceId);
          return newDeviceId;
        } else {
          if (!newDeviceId) {
            console.error('TrackRow: Reconnection reported success but no device ID found');
          }
          if (!isTokenValid(spotifyUserTokens?.accessToken)) {
            console.error('TrackRow: Reconnection reported success but token is invalid');
          }
          return null;
        }
      } else {
        if (reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS - 1) {
          // On last attempt, suggest page refresh
          console.error('TrackRow: Failed to reconnect Spotify player after multiple attempts');
          setError('Spotify player connection lost. Please refresh the page to reconnect.');
        } else {
          console.error('TrackRow: Failed to reconnect Spotify player, will retry on next playback attempt');
          setError('Connection to Spotify player lost. Try again or refresh the page.');
        }
        return null;
      }
    } catch (err) {
      console.error('TrackRow: Error during player reconnection:', err);
      setError('Error reconnecting Spotify player. Please refresh the page.');
      return null;
    } finally {
      setIsReconnecting(false);
    }
  };

  // Helper function to play a track with a specific device ID
  const playTrackWithDeviceId = async (trackUri: string, token: string, deviceId: string) => {
    // Special handling for placeholder token
    if (token === 'backend-managed-token') {
      console.log('TrackRow: Detected placeholder token, need to refresh auth first');
      try {
        const { refreshAuthState } = await import('../utils/authUtils');
        await refreshAuthState();
        
        // Get fresh token after refresh
        const refreshedToken = usePlaybackStore.getState().spotifyUserTokens?.accessToken;
        if (!refreshedToken || refreshedToken === 'backend-managed-token') {
          setError('Unable to play: Please log in with Spotify Premium');
          throw new Error('Still have placeholder token after refresh');
        }
        
        // Use the refreshed token
        token = refreshedToken;
        console.log('TrackRow: Successfully replaced placeholder token with real token');
      } catch (err) {
        console.error('TrackRow: Failed to refresh auth for placeholder token:', err);
        setError('Authentication error. Please log in again with Spotify.');
        throw err;
      }
    }
    
    const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
    try {
      console.log(`TrackRow: Sending playback request to ${url} with token length ${token.length}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      // Handle specific error cases
      if (response.status === 401) {
        console.error('TrackRow: Authentication failed (401). Token may be expired.');
        // Trigger a fresh sync of the auth state
        try {
          const { refreshAuthState } = await import('../utils/authUtils');
          await refreshAuthState();
          console.log('TrackRow: Attempted to refresh authentication state after 401 error');
          setError('Authentication token expired. Refreshed token - please try again.');
        } catch (refreshError) {
          console.error('TrackRow: Failed to refresh auth state:', refreshError);
          setError('Authentication error. Please try logging in again or refresh the page.');
        }
      } else if (response.status === 403) {
        console.error('TrackRow: Forbidden (403). This often happens for non-Premium accounts.');
        setError('Spotify Premium is required to play tracks. Please upgrade your account.');
      } else if (response.status === 404) {
        console.error('TrackRow: Device not found (404). Will attempt to reconnect.');
        // Let the caller handle this since it needs to reconnect the device
      } else if (!response.ok) {
        const errorText = await response.text();
        console.error(`TrackRow: Failed to play track. Status: ${response.status}, Error: ${errorText}`);
        setError(`Playback error (${response.status}). Please try again or refresh the page.`);
      }

      return response;
    } catch (error) {
      console.error('TrackRow: Network error during playback request:', error);
      setError('Network error. Check your connection and try again.');
      // Return a fake response to maintain the expected return type
      return new Response(null, { status: 500 });
    }
  };

  // Play the track using Spotify API
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Get current playback state from the store
    const { currentTrackId: storeCurrentTrackId, isPlaying: storeIsPlaying } = usePlaybackStore.getState();

    // If this track row's track is ALREADY the current track in the store,
    // and the store says it's playing, then SpotifyPlayerControls is handling it.
    // Don't interfere by sending another play command.
    if (track.spotifyTrackId === storeCurrentTrackId && storeIsPlaying) {
      console.log(`TrackRow: Play clicked for ${track.title}, but it's already the current playing track. Skipping redundant play.`);
      return;
    }

    if (isReconnecting) {
      console.log('TrackRow: Currently reconnecting, please wait...');
      return;
    }

    // Clear any previous error message
    setError(null);

    console.log(`Play clicked for track: ${track.title} (Spotify ID: ${track.spotifyTrackId})`);

    // Get fresh values from the store
    const store = usePlaybackStore.getState();
    let currentToken = store.spotifyUserTokens?.accessToken;
    let currentDeviceId = store.deviceId;
    
    console.log(`TrackRow: Initial token check - ${currentToken ? `Token length: ${currentToken.length}` : 'No token'}, Device ID: ${currentDeviceId || 'None'}`);

    // Validate token before attempting playback
    if (!isTokenValid(currentToken)) {
      console.error('TrackRow: Access token is invalid or missing');
      // Attempt to refresh auth state before giving up
      try {
        const { refreshAuthState } = await import('../utils/authUtils');
        await refreshAuthState();
        console.log('TrackRow: Attempted to refresh tokens due to invalid token');
        
        // Check again after refresh
        const refreshedStore = usePlaybackStore.getState();
        currentToken = refreshedStore.spotifyUserTokens?.accessToken;
        
        if (!isTokenValid(currentToken)) {
          console.error('TrackRow: Token still invalid after refresh attempt');
          setError('Authentication error. Please log in again with Spotify.');
          return;
        }
        console.log('TrackRow: Successfully refreshed authentication tokens');
      } catch (refreshError) {
        console.error('TrackRow: Failed to refresh auth state:', refreshError);
        setError('Authentication error. Please try logging in again.');
        return;
      }
    }

    if (!currentToken || !currentDeviceId) {
      console.log('TrackRow: Access token or device ID missing. Attempting to wait for Spotify player initialization...');

      // Wait for the Spotify player to be ready
      const playerReady = await waitForSpotifyPlayer(15000, 500, 15); // Longer timeout for initial wait
      if (!playerReady) {
        console.error('TrackRow: Spotify player still not ready after waiting. Trying device reconnection...');
        await handleDeviceNotFound();

        // Check again after reconnection attempt
        const reconnectionStore = usePlaybackStore.getState();
        currentToken = reconnectionStore.spotifyUserTokens?.accessToken;
        currentDeviceId = reconnectionStore.deviceId;

        if (!currentToken || !currentDeviceId) {
          console.error('Cannot play: No access token or device ID available after reconnection attempts');
          setError('Spotify player not connected. Please refresh the page and try again.');
          return;
        }
        
        // Additional logging to help diagnose token issues
        if (currentToken) {
          console.log(`TrackRow: Token length after reconnection: ${currentToken.length}`);
          console.log(`TrackRow: Token valid after reconnection: ${isTokenValid(currentToken)}`);
        }
      } else {
        // Update with the latest values after successful waiting
        const readyStore = usePlaybackStore.getState();
        currentToken = readyStore.spotifyUserTokens?.accessToken;
        currentDeviceId = readyStore.deviceId;
      }
    }

    if (!track.spotifyTrackId) {
      console.error('Cannot play: No Spotify track ID available');
      return;
    }

    try {
      // Form the track URI from the ID
      const trackUri = `spotify:track:${track.spotifyTrackId}`;
      let deviceToUse = currentDeviceId;

      console.log(`TrackRow: Attempting to play ${trackUri} on device ${deviceToUse}`);
      
      // Special handling for placeholder tokens
      if (currentToken === 'backend-managed-token') {
        console.log('TrackRow: Detected placeholder token, refreshing authentication');
        try {
          const { refreshAuthState } = await import('../utils/authUtils');
          await refreshAuthState();
          
          // Get fresh token after refresh
          const refreshedStore = usePlaybackStore.getState();
          currentToken = refreshedStore.spotifyUserTokens?.accessToken;
          deviceToUse = refreshedStore.deviceId || deviceToUse; // Also get fresh device ID
          
          console.log(`TrackRow: After auth refresh - ${currentToken ? `Token length: ${currentToken.length}` : 'No token'}, Device ID: ${deviceToUse || 'None'}`);
        } catch (err) {
          console.error('TrackRow: Failed to refresh auth for placeholder token:', err);
        }
      }
      
      // Ensure we have valid strings for the API call
      if (!currentToken || !deviceToUse) {
        setError('Missing token or device ID for playback. Please refresh the page or log in again.');
        throw new Error('Missing token or device ID for playback');
      }
      
      // First attempt to play the track
      let response = await playTrackWithDeviceId(trackUri, currentToken as string, deviceToUse);

      // If we get a device not found error, try to reconnect
      if (!response.ok && response.status === 404) {
        try {
          const errorData = await response.json();
          if (errorData.error?.message?.includes('Device not found')) {
            console.error('TrackRow: Device not found error, attempting to reconnect...');
            setError('Spotify player disconnected. Attempting to reconnect...');

            // Try to reconnect and get a new device ID
            const newDeviceId = await handleDeviceNotFound();

            // If we got a new device ID, retry playback
            if (newDeviceId) {
              deviceToUse = newDeviceId;
              if (newDeviceId && currentToken) {
                setError(null); // Clear error if reconnection was successful
                response = await playTrackWithDeviceId(trackUri, currentToken, newDeviceId);
              } else {
                throw new Error('Failed to get valid device ID or token after reconnection');
              }
            }
          }
        } catch (jsonError) {
          console.error('TrackRow: Error parsing device not found response:', jsonError);
          setError('Error connecting to Spotify. This may be due to database connection issues.');
        }
      }

      // Final check if the request was successful
      if (!response.ok) {
        try {
          const errorData = await response.json();
          const errorMessage = errorData.error?.message || 'Failed to play track';
          console.error('TrackRow: Playback failed:', errorMessage);

          // If we haven't set an error yet, set one now
          if (!error) {
            setError(`Playback failed: ${errorMessage}`);
          }
          throw new Error(errorMessage);
        } catch (jsonError) {
          console.error('TrackRow: Error parsing error response:', jsonError);
          setError('Playback error. Database connection issues may be preventing proper authentication.');
          throw new Error('Failed to parse error response');
        }
      }

      // If we get here, playback was successful
      setError(null); // Clear any previous errors

      // Update the playback state
      setIsPlaying(true);
      setCurrentTrackId(track.spotifyTrackId);
    } catch (err) {
      console.error('Error playing track:', err);
    }
  };

  // Renders artist names as links
  const renderArtistLinks = () => {
    if (!track.artists || track.artists.length === 0) return <span>Unknown Artist</span>;

    return track.artists.map((artist, index) => (
      <React.Fragment key={artist.id}>
        {index > 0 && ", "}
        <Link
          to={`/artists/${artist.id}`}
          className="hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {artist.name}
        </Link>
      </React.Fragment>
    ));
  };

  // Format release month/day if available
  const formatReleaseDate = (month?: number | null): string => {
    if (month) {
      // Simple month abbreviation
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[month - 1]}`;
    }
    return 'N/A';
  };

  // Clean song title by removing featuring artist text
  const cleanSongTitle = (title: string): string => {
    // First remove featuring patterns with various formats
    let cleanedTitle = title
      // Remove "feat. Artist" or "feat Artist" or "ft. Artist" or "ft Artist" or "featuring Artist"
      .replace(/\s*[\(\[\{]?\s*(?:feat|ft|featuring)\.?\s+[^\)\]\}]+[\)\]\}]?/gi, '')
      // Handle "(with Artist)" pattern
      .replace(/\s*[\(\[\{]?\s*with\s+[^\)\]\}]+[\)\]\}]?/gi, '')
      // Handle comma-separated list of artists in parentheses like "(Yo Gotti, EST Gee)"
      .replace(/\s*\([^\)]*,\s*[^\)]*\)/g, '')
      // Also handle patterns where featuring info is at the end without parentheses
      .replace(/\s+(?:feat|ft|featuring)\.?\s+.+$/gi, '')
      // Handle "with Artist" at the end without parentheses
      .replace(/\s+with\s+.+$/gi, '');

    // Then remove any empty parentheses, brackets, or braces that might remain
    cleanedTitle = cleanedTitle
      .replace(/\(\s*\)/g, '') // Empty parentheses
      .replace(/\[\s*\]/g, '') // Empty brackets
      .replace(/\{\s*\}/g, '') // Empty braces
      .trim();

    return cleanedTitle;
  };

  return (
    <tr
      className={`track-row cursor-pointer ${isReconnecting ? 'opacity-50' : ''}`}
      onClick={handlePlayClick}
    >
      <td>
        <div className="song-cell relative">
          {isReconnecting && (
            <span className="text-xs text-white/70 ml-2">Reconnecting...</span>
          )}
          <img
            src={track.coverImageUrl || 'https://placehold.co/40x40/121212/FFFFFF?text=NA'}
            alt={track.title}
            className="album-art-small"
          />
          <span title={track.title}>{cleanSongTitle(track.title)}</span>
          {error && <span className="text-red-500 text-xs block mt-1">{error}</span>}
        </div>
      </td>
      <td>{renderArtistLinks()}</td>
      <td>{track.album?.name || 'Unknown Album'}</td>
      <td className="text-center">{formatReleaseDate(track.releaseMonth)}</td>
      <td className="text-center">{track.releaseYear}</td>
    </tr>
  );
};

export default TrackRow;
