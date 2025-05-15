// src/components/TrackRow.tsx
import React, { useState } from 'react';
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
  
  // Get token and device ID from store
  const setIsPlaying = usePlaybackStore(state => state.setIsPlaying);
  const setCurrentTrackId = usePlaybackStore(state => state.setCurrentTrackId);
  const setDeviceId = usePlaybackStore(state => state.setDeviceId);
  const setSpotifyPlayerReady = usePlaybackStore(state => state.setSpotifyPlayerReady);
  
  // Wait for Spotify player to be ready with device ID
  const waitForSpotifyPlayer = async (maxWaitMs = 10000, checkIntervalMs = 500, maxRetries = 10): Promise<boolean> => {
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
  
  // Handle reconnection when device is not found
  const handleDeviceNotFound = async () => {
    console.log('TrackRow: Device not found, attempting to reconnect Spotify player...');
    setIsReconnecting(true);
    
    try {
      // Reset device state in the store
      setDeviceId(null);
      setSpotifyPlayerReady(false);
      
      // Wait a short time before checking for a new device ID
      // This gives the SpotifyPlayer component time to detect the reset and reinitialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to get a new device ID with limited retries
      const reconnected = await waitForSpotifyPlayer(8000, 500, 5); // 8 second timeout, 0.5s interval, max 5 retries
      
      if (reconnected) {
        // Get the updated device ID
        const { deviceId: newDeviceId } = usePlaybackStore.getState();
        if (newDeviceId) {
          console.log('TrackRow: Successfully reconnected Spotify player with device ID:', newDeviceId);
          return newDeviceId;
        } else {
          console.error('TrackRow: Reconnection reported success but no device ID found');
          return null;
        }
      } else {
        // Don't auto-reload the page, just inform the user
        console.error('TrackRow: Failed to reconnect Spotify player after device not found error');
        setError('Spotify player connection lost. Please try refreshing the page.');
        return null;
      }
    } catch (err) {
      console.error('TrackRow: Error during player reconnection:', err);
      return null;
    } finally {
      setIsReconnecting(false);
    }
  };

  // Helper function to play a track with a specific device ID
  const playTrackWithDeviceId = async (trackUri: string, token: string, deviceId: string) => {
    const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });
  };
  
  // Play the track using Spotify API
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isReconnecting) {
      console.log('TrackRow: Currently reconnecting, please wait...');
      return;
    }
    
    console.log(`Play clicked for track: ${track.title} (Spotify ID: ${track.spotifyTrackId})`);
    
    // Get fresh values from the store
    const store = usePlaybackStore.getState();
    let currentToken = store.spotifyUserTokens?.accessToken;
    let currentDeviceId = store.deviceId;
    
    if (!currentToken || !currentDeviceId) {
      console.log('TrackRow: Access token or device ID missing. Attempting to wait for Spotify player initialization...');
      
      // Wait for the Spotify player to be ready
      const playerReady = await waitForSpotifyPlayer();
      if (!playerReady) {
        console.error('TrackRow: Spotify player still not ready after waiting. Trying device reconnection...');
        await handleDeviceNotFound();
        
        // Check again after reconnection attempt
        const reconnectionStore = usePlaybackStore.getState();
        currentToken = reconnectionStore.spotifyUserTokens?.accessToken;
        currentDeviceId = reconnectionStore.deviceId;
        
        if (!currentToken || !currentDeviceId) {
          console.error('Cannot play: No access token or device ID available after reconnection attempts');
          return;
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
      
      // Ensure we have valid strings for the API call
      if (!currentToken || !deviceToUse) {
        throw new Error('Missing token or device ID for playback');
      }
      
      // First attempt to play the track
      let response = await playTrackWithDeviceId(trackUri, currentToken, deviceToUse);
      
      // If we get a device not found error, try to reconnect
      if (!response.ok && response.status === 404) {
        const errorData = await response.json();
        if (errorData.error?.message?.includes('Device not found')) {
          console.error('TrackRow: Device not found error, attempting to reconnect...');
          
          // Try to reconnect and get a new device ID
          const newDeviceId = await handleDeviceNotFound();
          
          // If we got a new device ID, retry playback
          if (newDeviceId) {
            deviceToUse = newDeviceId;
            if (newDeviceId && currentToken) {
              response = await playTrackWithDeviceId(trackUri, currentToken, newDeviceId);
            } else {
              throw new Error('Failed to get valid device ID or token after reconnection');
            }
          }
        }
      }
      
      // Final check if the request was successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to play track');
      }
      
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
          <span>{track.title}</span>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
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
