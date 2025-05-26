import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePlaybackStore, selectSpotifyAccessToken, selectDeviceId, selectIsPlaying, selectCurrentTrackId } from '../store/playbackStore';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute, FaVolumeDown } from 'react-icons/fa';

// Direct Spotify API URLs
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Spotify Player API endpoints
const SPOTIFY_PLAYER_STATE_URL = `${SPOTIFY_API_BASE}/me/player`;             // For GET current player state
const SPOTIFY_PLAYER_PLAY_URL = `${SPOTIFY_API_BASE}/me/player/play`;         // For PUT to start/resume playback
const SPOTIFY_PLAYER_PAUSE_URL = `${SPOTIFY_API_BASE}/me/player/pause`;       // For PUT to pause playback
const SPOTIFY_PLAYER_NEXT_URL = `${SPOTIFY_API_BASE}/me/player/next`;         // For POST to skip to next
const SPOTIFY_PLAYER_PREVIOUS_URL = `${SPOTIFY_API_BASE}/me/player/previous`; // For POST to skip to previous
const SPOTIFY_PLAYER_VOLUME_URL = `${SPOTIFY_API_BASE}/me/player/volume`;     // For PUT to set volume
// Note: For transferring playback (PUT /me/player with device_ids in body), SPOTIFY_PLAYER_STATE_URL is used with PUT

interface TrackInfo {
  name: string;
  artists: string[];
  albumArt: string;
  isPlaying: boolean;
}

interface SpotifyPlaybackState {
  device?: {
    volume_percent?: number;
  };
  item?: {
    id?: string; // Track ID needed for playback state tracking
    name: string;
    artists: { name: string }[];
    album: {
      images: { url: string }[];
    };
  };
  is_playing?: boolean;
}

const SpotifyPlayerControls: React.FC = () => {
  const accessToken = usePlaybackStore(selectSpotifyAccessToken);
  const deviceId = usePlaybackStore(selectDeviceId);
  const isPlaying = usePlaybackStore(selectIsPlaying);
  const currentTrackId = usePlaybackStore(selectCurrentTrackId);
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(50);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastVolume, setLastVolume] = useState<number>(50);

  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<F>) => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => func(...args), waitFor);
    };

    return debounced as (...args: Parameters<F>) => ReturnType<F>;
  };

  /**
   * Make a request to the Spotify API
   * @param endpoint Base endpoint URL or full URL
   * @param method HTTP method (GET, POST, PUT, DELETE)
   * @param body Optional body for POST/PUT requests
   * @param queryParams Optional query parameters
   * @returns Promise with response data or void
   */
  const spotifyApiRequest = async <T = any>(
    endpoint: string,
    method: string,
    body?: any,
    queryParams?: Record<string, string>
  ): Promise<T | void> => {
    if (!accessToken || !deviceId) {
      setError('No access token or device ID available');
      return Promise.reject('No access token or device ID');
    }

    setLoading(true);
    setError(null);

    try {
      // Construct URL with query parameters if provided
      let url = endpoint;
      if (queryParams && Object.keys(queryParams).length > 0) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          params.append(key, value);
        });
        url = `${endpoint}?${params.toString()}`;
      }
      
      // Add detailed logging for next/previous track requests
      if (method === 'POST' && (endpoint === SPOTIFY_PLAYER_NEXT_URL || endpoint === SPOTIFY_PLAYER_PREVIOUS_URL)) {
        const action = endpoint === SPOTIFY_PLAYER_NEXT_URL ? 'Next Track' : 'Previous Track';
        const tokenPreview = accessToken ? 
          `Bearer ${accessToken.substring(0, 5)}...${accessToken.substring(accessToken.length - 5)}` : 
          'No token';
        console.log(`Spotify API: Sending ${action} command to ${url}`);
        console.log(`Spotify API: Method: ${method}, Auth: ${tokenPreview}, Device ID: ${deviceId}`);
      }

      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      };

      const response = await fetch(url, options);
      
      // Log response status for next/previous track requests
      if (method === 'POST' && (endpoint === SPOTIFY_PLAYER_NEXT_URL || endpoint === SPOTIFY_PLAYER_PREVIOUS_URL)) {
        const action = endpoint === SPOTIFY_PLAYER_NEXT_URL ? 'Next Track' : 'Previous Track';
        console.log(`Spotify API: ${action} command response status: ${response.status}, ok: ${response.ok}`);
        
        // Special logging for 204 No Content success responses
        if (response.ok && response.status === 204) {
          console.log(`Spotify API: ${action} command succeeded with status 204 (No Content)`);
        }
      }
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `Spotify API request to ${endpoint} failed with status ${response.status}`;
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData?.error?.message || errorData?.message || JSON.stringify(errorData).substring(0, 200) || errorMessage;
          } catch (jsonError: any) {
            console.error("Failed to parse JSON error response:", jsonError);
            // Try to get raw text if JSON parsing fails
            try {
              const textError = await response.text();
              errorMessage = `${errorMessage}. Response: ${textError.substring(0, 200)}`;
            } catch (textReadError) {
              // Fallback if text cannot be read
              errorMessage = `${errorMessage}. Failed to read error response body.`;
            }
          }
        } else {
          // Handle non-JSON error responses (e.g., HTML)
          try {
            const textError = await response.text();
            console.error(`Spotify API returned non-JSON error (${contentType}):`, textError.substring(0, 500));
            errorMessage = `${errorMessage}. Expected JSON but got ${contentType || 'unknown content type'}. Snippet: ${textError.substring(0, 100)}`;
          } catch (textError) {
            errorMessage = `${errorMessage}. Expected JSON but got ${contentType || 'unknown content type'}, and failed to read response text.`;
          }
        }
        throw new Error(errorMessage);
      }
      
      // Handle successful 204 No Content responses explicitly
      if (response.status === 204) {
        // Additional logging for next/previous track 204 responses
        if (method === 'POST' && (endpoint === SPOTIFY_PLAYER_NEXT_URL || endpoint === SPOTIFY_PLAYER_PREVIOUS_URL)) {
          const action = endpoint === SPOTIFY_PLAYER_NEXT_URL ? 'Next Track' : 'Previous Track';
          console.log(`Spotify API: ${action} command successfully processed with 204 No Content response`);
        }
        return; // Successfully processed, no content to return or parse
      }

      // For other successful 2xx responses, check content type
      const contentType = response.headers.get("content-type");
      
      // Special handling for GET requests to player state endpoint
      // Spotify API sometimes returns null content-type for JSON responses
      if ((method === 'GET' && (endpoint === SPOTIFY_PLAYER_STATE_URL || endpoint.startsWith(SPOTIFY_PLAYER_STATE_URL + '?'))) ||
          (contentType && contentType.includes("application/json"))) {
        try {
          const data = await response.json();
          // Specific handling for /v1/me/player endpoint to update trackInfo and Zustand store
          if ((endpoint === SPOTIFY_PLAYER_STATE_URL || endpoint.startsWith(SPOTIFY_PLAYER_STATE_URL + '?')) && data) {
            const store = usePlaybackStore.getState();
            if (data.item) {
              setTrackInfo({
                name: data.item.name,
                artists: data.item.artists.map((artist: any) => artist.name),
                albumArt: data.item.album.images[0]?.url || '',
                isPlaying: data.is_playing ?? false, // Ensure boolean
              });
              if (data.item.id && store.currentTrackId !== data.item.id) {
                store.setCurrentTrackId(data.item.id);
              }
              // Optionally, update a more detailed currentTrack object in the store if it exists
              // e.g., store.setCurrentTrackDetails({ id: data.item.id, name: data.item.name, ... });
            } else {
              // No item is playing, clear local trackInfo and update store
              setTrackInfo(null);
              if (store.currentTrackId !== null) { // Avoid unnecessary store update
                store.setCurrentTrackId(null);
              }
              // e.g., store.setCurrentTrackDetails(null);
            }

            // Update isPlaying in the store based on the response
            if (store.isPlaying !== (data.is_playing ?? false)) {
              store.setIsPlaying(data.is_playing ?? false);
            }

            // Update volume from device info if present
            if (data.device && typeof data.device.volume_percent === 'number') {
              setVolume(data.device.volume_percent);
              if (data.device.volume_percent === 0) {
                setIsMuted(true);
              } else if (isMuted && data.device.volume_percent > 0) {
                setIsMuted(false); // Unmute locally if Spotify reports volume > 0
              }
            }
          }
          return data as T;
        } catch (jsonParseError: any) {
          let responseTextSnippet = "(could not read response text after JSON parse failure)";
          try {
             const errorText = await response.text(); // Attempt to get text for diagnostics
             responseTextSnippet = errorText.substring(0, 200);
             console.error(`Spotify API response (Content-Type: application/json) was not valid JSON. Snippet: ${responseTextSnippet}`, jsonParseError);
          } catch (textReadError) {
            console.error(`Spotify API response (Content-Type: application/json) was not valid JSON, and also failed to read as text.`, jsonParseError, textReadError);
          }
          throw new Error(`Failed to parse JSON response from ${endpoint}. API returned Content-Type: application/json, but body was not valid JSON. Snippet: ${responseTextSnippet}`);
        }
      } else {
        // Successful 2xx response, but status is not 204 and Content-Type is not JSON.
        // Check if this is an expected non-JSON response type (e.g., some PUT/POST operations based on original logic).
        if (method === 'PUT' || method === 'DELETE' || (method === 'POST' && !endpoint.includes(SPOTIFY_PLAYER_STATE_URL))) {
            console.warn(`Spotify API request to ${endpoint} (Method: ${method}) succeeded with status ${response.status} but returned non-JSON content-type: ${contentType}. Assuming no content expected.`);
            return; // No content expected for this type of request.
        }
        // For GET requests to player state endpoint, attempt to parse as JSON even with null content-type
        if (method === 'GET' && (endpoint === SPOTIFY_PLAYER_STATE_URL || endpoint.startsWith(SPOTIFY_PLAYER_STATE_URL + '?'))) {
          try {
            const data = await response.json();
            const store = usePlaybackStore.getState();
            // Update track info if available
            if (data && data.item) {
              setTrackInfo({
                name: data.item.name,
                artists: data.item.artists.map((artist: any) => artist.name),
                albumArt: data.item.album.images[0]?.url || '',
                isPlaying: data.is_playing ?? false, // Ensure boolean
              });
              if (data.item.id && store.currentTrackId !== data.item.id) {
                store.setCurrentTrackId(data.item.id);
              }
              // e.g., store.setCurrentTrackDetails({ id: data.item.id, name: data.item.name, ... });
            } else {
              // No item is playing, clear local trackInfo and update store
              setTrackInfo(null);
              if (store.currentTrackId !== null) { // Avoid unnecessary store update
                store.setCurrentTrackId(null);
              }
              // e.g., store.setCurrentTrackDetails(null);
            }

            // Update isPlaying in the store based on the response
            if (store.isPlaying !== (data.is_playing ?? false)) {
              store.setIsPlaying(data.is_playing ?? false);
            }

            // Update volume from device info if present
            if (data.device && typeof data.device.volume_percent === 'number') {
              setVolume(data.device.volume_percent);
              if (data.device.volume_percent === 0) {
                setIsMuted(true);
              } else if (isMuted && data.device.volume_percent > 0) {
                setIsMuted(false); // Unmute locally if Spotify reports volume > 0
              }
            }
            return data as T;
          } catch (jsonParseError) {
            console.error(`Attempted to parse response as JSON for ${endpoint} despite null content-type, but failed:`, jsonParseError);
          }
        
          // Otherwise, it's an unexpected non-JSON response.
          try {
            (await response.text()).substring(0,200); // Keep the read attempt if side effects are desired, or remove if not
          } catch (e) {
            console.warn("Could not read response body for non-JSON 2xx error reporting", e);
          }
          console.error(`Spotify API request to ${endpoint} returned unexpected content-type: ${contentType || 'unknown'}. Expected JSON for a ${response.status} response with method ${method}.`);
          throw new Error(`Spotify API request to ${endpoint} returned unexpected content-type: ${contentType || 'unknown'}. Expected JSON for a ${response.status} response with method ${method}.`);
        }
      }
    } catch (err) {
      console.error('Error making API request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return Promise.reject(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSetSpotifyVolume = useCallback(
    debounce(async (newVolume: number) => {
      if (!accessToken || !deviceId) {
        setError('Access token or device ID not available for volume control.');
        return;
      }
      try {
        await spotifyApiRequest(
          SPOTIFY_PLAYER_VOLUME_URL,
          'PUT',
          undefined,
          {
            volume_percent: Math.round(newVolume).toString(),
            device_id: deviceId
          }
        );
      } catch (err: any) {
        console.error('Error setting volume (debounced):', err);
      }
    }, 500),
    [accessToken, deviceId]
  );

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    if (newVolume === 0) {
        setIsMuted(true);
    }
    debouncedSetSpotifyVolume(newVolume);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(lastVolume > 0 ? lastVolume : 50); 
      debouncedSetSpotifyVolume(lastVolume > 0 ? lastVolume : 50);
    } else {
      setLastVolume(volume); 
      setIsMuted(true);
      setVolume(0);
      debouncedSetSpotifyVolume(0);
    }
  };

  const playTrack = async (trackUri?: string): Promise<void> => {
    if (!accessToken || !deviceId) {
      setError('No access token or device ID available for playback.');
      return;
    }
    try {
      const body = trackUri ? { uris: [trackUri] } : undefined; 
      setLoading(true);
      await spotifyApiRequest(
        SPOTIFY_PLAYER_PLAY_URL,
        'PUT',
        body,
        { device_id: deviceId }
      );
      // Wait for Spotify to update state
      setTimeout(async () => {
        await spotifyApiRequest<SpotifyPlaybackState>(SPOTIFY_PLAYER_STATE_URL, 'GET');
        setLoading(false);
      }, 400);
    } catch (err: any) {
      setLoading(false);
      if (err?.message?.includes('404')) {
        setError('Spotify device not found. Attempting to recover...');
        setTimeout(() => window.location.reload(), 2000);
      } else if (err?.message?.toLowerCase().includes('token')) {
        setError('Spotify authentication error. Please log in again.');
      } else {
        setError('Error playing track: ' + (err?.message || err));
      }
      console.error('Error playing track:', err);
    }
  };

  const pauseTrack = async () => {
    try {
      // First make sure we have a player connection
      const isConnected = await ensurePlayerConnection();
      if (!isConnected) {
        return;
      }
      
      // Get fresh store values after potential reconnection
      const store = usePlaybackStore.getState();
      const currentToken = store.spotifyUserTokens?.accessToken;
      const currentDeviceId = store.deviceId;
      
      if (!currentToken || !currentDeviceId) {
        setError('Player not connected. Please reload the page.');
        return;
      }
      
      setLoading(true);
      await spotifyApiRequest(
        SPOTIFY_PLAYER_PAUSE_URL, 
        'PUT', 
        undefined, 
        { device_id: currentDeviceId }
      );
      
      // Update UI to reflect paused state
      store.setIsPlaying(false);
      
      // Get updated playback state
      await spotifyApiRequest<SpotifyPlaybackState>(SPOTIFY_PLAYER_STATE_URL, 'GET');
      setError(null); // Clear errors on success
      setLoading(false);
    } catch (err) {
      console.error('Error pausing track:', err);
      setError('Failed to pause. Please try again.');
      setLoading(false);
    }
  };

  // Attempt to restore the player connection if needed
  const ensurePlayerConnection = async (): Promise<boolean> => {
    // If we have both access token and device ID, we're good to go
    if (accessToken && deviceId) {
      return true;
    }

    try {
      console.log('PlayerControls: Attempting to restore player connection...');
      setLoading(true);
      setError('Reconnecting to player...');
      
      // Check if we have a token but no device ID - this means the player lost connection
      if (accessToken && !deviceId) {
        // First try refreshing auth state
        const { refreshAuthState } = await import('../utils/authUtils');
        await refreshAuthState();
        
        // Wait a moment for player to potentially reconnect
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we have a device ID now
        const currentState = usePlaybackStore.getState();
        if (currentState.deviceId) {
          console.log('PlayerControls: Successfully restored device connection');
          setError(null);
          return true;
        }
        
        // If still no device, suggest page reload
        console.error('PlayerControls: Could not restore player connection');
        setError('Player connection lost. Please reload the page.');
        return false;
      } else {
        // No access token - need to login again
        setError('Please login with Spotify to use the player.');
        return false;
      }
    } catch (err) {
      console.error('Error ensuring player connection:', err);
      setError('Failed to reconnect player. Please reload the page.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextTrack = async () => {
    try {
      setLoading(true);
      
      // First make sure we have a player connection
      const isConnected = await ensurePlayerConnection();
      if (!isConnected) {
        return;
      }
      
      // Get fresh store values after potential reconnection
      const store = usePlaybackStore.getState();
      const currentToken = store.spotifyUserTokens?.accessToken;
      const currentDeviceId = store.deviceId;
      
      if (!currentToken || !currentDeviceId) {
        setError('Player not connected. Please reload the page.');
        setLoading(false);
        return;
      }
      
      console.log(`Sending next track command to device ${currentDeviceId}...`);
      
      // Detailed logging for next track command
      const nextTokenPreview = currentToken ? 
        `Bearer ${currentToken.substring(0, 5)}...${currentToken.substring(currentToken.length - 5)}` : 
        'No token';
      console.log(`Spotify API: Sending Next Track command to ${SPOTIFY_PLAYER_NEXT_URL}?device_id=${currentDeviceId}`);
      console.log(`Spotify API: Method: POST, Auth: ${nextTokenPreview}, Device ID: ${currentDeviceId}`);
      
      // Send the next track command - don't throw on 204/no content
      try {
        // Use fetch directly to avoid processing error for empty responses
        const response = await fetch(`${SPOTIFY_PLAYER_NEXT_URL}?device_id=${currentDeviceId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Detailed logging of response
        console.log(`Spotify API: Next Track command response status: ${response.status}, ok: ${response.ok}`);
        
        if (response.status === 204) {
          console.log(`Spotify API: Next Track command succeeded with status 204 (No Content)`);
        }
        
        if (response.status >= 200 && response.status < 300) {
          console.log(`Next track command succeeded with status ${response.status}`);
          // Success - UI will update via 'player_state_changed' event from SpotifyPlayer.tsx
          // store.setIsPlaying(true); // Commented out: Let SDK events handle this
          
          // Explicitly fetch the updated player state after a short delay
          setTimeout(async () => {
            try {
              console.log('Fetching current playback state after next track...');
              await spotifyApiRequest<SpotifyPlaybackState>(SPOTIFY_PLAYER_STATE_URL, 'GET');
            } catch (refreshErr) {
              console.error('Error refreshing track info after next:', refreshErr);
              // Optionally, inform user if refresh fails but command was ok
            } finally {
              setLoading(false); // Ensure loading is set to false after the refresh attempt
            }
          }, 800); // Delay to allow Spotify to update its state
        } else {
          // Real error - show to user
          setLoading(false); // Ensure loading is false if the command itself failed
          throw new Error(`Next track command failed with status ${response.status}`);
        }
      } catch (err) {
        console.error('Error sending next track command:', err);
        setError(`Failed to play next track: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error skipping to next track:', err);
      setError('Failed to play next track. Please try again.');
      setLoading(false); // Ensure loading is false on outer catch
    }
  };

  const previousTrack = async () => {
    try {
      setLoading(true);
      
      // First make sure we have a player connection
      const isConnected = await ensurePlayerConnection();
      if (!isConnected) {
        return;
      }
      
      // Get fresh store values after potential reconnection
      const store = usePlaybackStore.getState();
      const currentToken = store.spotifyUserTokens?.accessToken;
      const currentDeviceId = store.deviceId;
      
      if (!currentToken || !currentDeviceId) {
        setError('Player not connected. Please reload the page.');
        setLoading(false);
        return;
      }
      
      console.log(`Sending previous track command to device ${currentDeviceId}...`);
      
      // Detailed logging for previous track command
      const prevTokenPreview = currentToken ? 
        `Bearer ${currentToken.substring(0, 5)}...${currentToken.substring(currentToken.length - 5)}` : 
        'No token';
      console.log(`Spotify API: Sending Previous Track command to ${SPOTIFY_PLAYER_PREVIOUS_URL}?device_id=${currentDeviceId}`);
      console.log(`Spotify API: Method: POST, Auth: ${prevTokenPreview}, Device ID: ${currentDeviceId}`);
      
      // Send the previous track command - don't throw on 204/no content
      try {
        // Use fetch directly to avoid processing error for empty responses
        const response = await fetch(`${SPOTIFY_PLAYER_PREVIOUS_URL}?device_id=${currentDeviceId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Detailed logging of response
        console.log(`Spotify API: Previous Track command response status: ${response.status}, ok: ${response.ok}`);
        
        if (response.status === 204) {
          console.log(`Spotify API: Previous Track command succeeded with status 204 (No Content)`);
        }
        
        if (response.status >= 200 && response.status < 300) {
          console.log(`Previous track command succeeded with status ${response.status}`);
          // Success - UI will update via 'player_state_changed' event from SpotifyPlayer.tsx
          // store.setIsPlaying(true); // Commented out: Let SDK events handle this

          // Explicitly fetch the updated player state after a short delay
          setTimeout(async () => {
            try {
              console.log('Fetching current playback state after previous track...');
              await spotifyApiRequest<SpotifyPlaybackState>(SPOTIFY_PLAYER_STATE_URL, 'GET');
            } catch (refreshErr) {
              console.error('Error refreshing track info after previous track:', refreshErr);
              // Optionally, inform user if refresh fails but command was ok
            } finally {
              setLoading(false); // Ensure loading is set to false after the refresh attempt
            }
          }, 800); // Delay
        } else {
          // Real error - show to user
          setLoading(false); // Ensure loading is false if the command itself failed
          throw new Error(`Previous track command failed with status ${response.status}`);
        }
      } catch (err) {
        console.error('Error sending previous track command:', err);
        setError(`Failed to play previous track: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error skipping to previous track:', err);
      setError('Failed to play previous track. Please try again.');
      setLoading(false); // Ensure loading is false on outer catch
    }
  };

  // Track the last time we refreshed playback data
  const lastRefreshTimeRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);
  
  // Function to fetch current playback state
  const fetchCurrentPlaybackState = async (force = false) => {
    // Don't allow multiple concurrent refreshes
    if (isRefreshingRef.current && !force) {
      return null;
    }
    
    // Check if we've refreshed recently (within last 2 seconds)
    const now = Date.now();
    if (!force && now - lastRefreshTimeRef.current < 2000) {
      // Skip this refresh as it's too soon after the last one
      return null;
    }
    
    if (accessToken && deviceId) {
      try {
        isRefreshingRef.current = true;
        lastRefreshTimeRef.current = now;
        
        const playbackState = await spotifyApiRequest<SpotifyPlaybackState>(SPOTIFY_PLAYER_STATE_URL, 'GET');
        
        // Update volume if available
        if (playbackState && playbackState.device && typeof playbackState.device.volume_percent === 'number') {
          setVolume(playbackState.device.volume_percent);
          if (playbackState.device.volume_percent === 0) {
            setIsMuted(true);
          }
        }
        
        // If we got a response but trackInfo wasn't set from the spotifyApiRequest function,
        // set it manually here (spotifyApiRequest should now handle this, but this is a safe fallback)
        if (playbackState && playbackState.item && 
            (!trackInfo || 
             trackInfo.name !== playbackState.item.name || 
             trackInfo.isPlaying !== (playbackState.is_playing ?? false)
            )
           ) {
          setTrackInfo({
            name: playbackState.item.name,
            artists: playbackState.item.artists.map(artist => artist.name),
            albumArt: playbackState.item.album.images[0]?.url || '',
            isPlaying: playbackState.is_playing ?? false, // Ensure boolean
          });
        } else if (playbackState && !playbackState.item && trackInfo !== null) {
          // If no item is playing, and trackInfo is not already null, clear it locally.
          // spotifyApiRequest should have already updated the store.
          setTrackInfo(null);
        }
        
        return playbackState;
      } catch (err) {
        console.error('Failed to fetch playback state:', err);
        return null;
      } finally {
        isRefreshingRef.current = false;
      }
    }
    return null;
  };
  
  // Load initial playback state when component mounts or device ID changes
  useEffect(() => {
    if (deviceId) {
      fetchCurrentPlaybackState();
    }
  }, [accessToken, deviceId]);
  
  // Use a ref to track the previous track ID to avoid redundant updates
  const prevTrackIdRef = useRef<string | null>(null);
  const prevIsPlayingRef = useRef<boolean | null>(null);
  
  // Listen for changes to playback state in the store
  useEffect(() => {
    // Only update if there's a meaningful change
    if (currentTrackId === prevTrackIdRef.current && isPlaying === prevIsPlayingRef.current) {
      return; // No change, skip update
    }
    
    // Update refs to current values
    prevTrackIdRef.current = currentTrackId;
    prevIsPlayingRef.current = isPlaying;
    
    // When isPlaying or currentTrackId changes in the store, refresh the track info
    const refreshPlaybackInfo = async () => {
      // Short delay to allow Spotify API to sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch current playback state - force refresh if track ID changed
      const playbackState = await fetchCurrentPlaybackState(currentTrackId !== null);
      
      // If we couldn't get playback state but we know a track is playing,
      // update the UI based on the store values
      if (!playbackState && currentTrackId && isPlaying) {
        setTrackInfo(prevInfo => ({
          ...prevInfo || {
            name: 'Unknown Track',
            artists: ['Unknown Artist'],
            albumArt: '',
          },
          isPlaying: isPlaying
        }));
      }
    };
    
    refreshPlaybackInfo();
  }, [isPlaying, currentTrackId, fetchCurrentPlaybackState, trackInfo]);

  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <FaVolumeMute />;
    if (volume < 50) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  if (!accessToken) {
    return (
      <div className="text-center p-4 text-white/70">
        <p>Please log in with Spotify to use the player.</p>
      </div>
    );
  }

  if (!deviceId) {
    return (
      <div className="text-center p-4 text-white/70">
        <p>Initializing Spotify player...</p>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {trackInfo?.albumArt ? (
            <img 
              src={trackInfo.albumArt} 
              alt="Album Cover" 
              className="w-16 h-16 object-cover rounded-md shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-white/5 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            {trackInfo ? (
              <>
                <p className="font-medium text-base text-white truncate">{trackInfo.name}</p>
                <p className="text-white/60 text-sm truncate">{trackInfo.artists.join(', ')}</p>
              </>
            ) : (
              <p className="text-white/60 text-sm">No track playing</p>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={previousTrack}
            disabled={loading}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50 p-2"
            aria-label="Previous track"
          >
            <FaStepBackward size={16} />
          </button>
          
          {trackInfo?.isPlaying ? (
            <button
              onClick={pauseTrack}
              disabled={loading}
              className="p-2 rounded-full bg-white text-black hover:scale-105 transition-transform disabled:opacity-50"
              aria-label="Pause"
            >
              <FaPause />
            </button>
          ) : (
            <button
              onClick={() => playTrack()}
              disabled={loading}
              className="p-2 rounded-full bg-white text-black hover:scale-105 transition-transform disabled:opacity-50"
              aria-label="Play"
            >
              <FaPlay />
            </button>
          )}
          
          <button
            onClick={nextTrack}
            disabled={loading}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50 p-2"
            aria-label="Next track"
          >
            <FaStepForward size={16} />
          </button>
        </div>

        <div className="flex items-center w-full max-w-xs space-x-2">
          <button onClick={toggleMute} className="p-2 hover:bg-gray-700 rounded-full">
            <VolumeIcon />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            disabled={!deviceId} 
          />
        </div>
      </div>
    </div>
  );
};

export default SpotifyPlayerControls;
