import React, { useState, useEffect, useCallback } from 'react';
import { usePlaybackStore, selectSpotifyAccessToken, selectDeviceId } from '../store/playbackStore';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute, FaVolumeDown } from 'react-icons/fa';

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

  const spotifyApiRequest = async <T = any>(endpoint: string, method: string, body?: any): Promise<T | void> => {
    if (!accessToken || !deviceId) {
      setError('No access token or device ID available');
      return Promise.reject('No access token or device ID');
    }

    setLoading(true);
    setError(null);

    try {
      const url = endpoint;
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      };

      const response = await fetch(url, options);
      
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
      
      if (response.status === 204 || method === 'PUT' || method === 'DELETE' || (method === 'POST' && !endpoint.includes('https://api.spotify.com/v1/me/player'))) {
        return; 
      }

      const data = await response.json();

      if (endpoint === 'https://api.spotify.com/v1/me/player' && data && data.item) {
        setTrackInfo({
          name: data.item.name,
          artists: data.item.artists.map((artist: any) => artist.name),
          albumArt: data.item.album.images[0]?.url || '',
          isPlaying: data.is_playing,
        });
      }
      return data as T;
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
          `https://api.spotify.com/v1/me/player/volume?volume_percent=${Math.round(newVolume)}&device_id=${deviceId}`,
          'PUT'
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

  const playTrack = async (trackUri?: string) => {
    if (!accessToken || !deviceId) {
      setError('No access token or device ID available for playback.');
      return;
    }
    try {
      const endpoint = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
      const body = trackUri ? { uris: [trackUri] } : undefined; 
      await spotifyApiRequest(endpoint, 'PUT', body);
      await spotifyApiRequest<SpotifyPlaybackState>('https://api.spotify.com/v1/me/player', 'GET');
    } catch (err) {
      console.error('Error playing track:', err);
    }
  };

  const pauseTrack = async () => {
    if (!accessToken || !deviceId) {
      setError('No access token or device ID available to pause.');
      return;
    }
    try {
      await spotifyApiRequest(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, 'PUT');
      await spotifyApiRequest<SpotifyPlaybackState>('https://api.spotify.com/v1/me/player', 'GET');
    } catch (err) {
      console.error('Error pausing track:', err);
    }
  };

  const nextTrack = async () => {
    if (!accessToken || !deviceId) {
      setError('No access token or device ID available to skip.');
      return;
    }
    try {
      await spotifyApiRequest(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, 'POST');
      setTimeout(() => spotifyApiRequest<SpotifyPlaybackState>('https://api.spotify.com/v1/me/player', 'GET'), 500);
    } catch (err) {
      console.error('Error skipping to next track:', err);
    }
  };

  const prevTrack = async () => {
    if (!accessToken || !deviceId) {
      setError('No access token or device ID available to skip.');
      return;
    }
    try {
      await spotifyApiRequest(`https://api.spotify.com/v1/me/player/previous?device_id=${deviceId}`, 'POST');
      setTimeout(() => spotifyApiRequest<SpotifyPlaybackState>('https://api.spotify.com/v1/me/player', 'GET'), 500);
    } catch (err) {
      console.error('Error skipping to previous track:', err);
    }
  };

  useEffect(() => {
    const fetchCurrentVolumeAndPlayback = async () => {
      if (accessToken && deviceId) {
        try {
          const playbackState = await spotifyApiRequest<SpotifyPlaybackState>('https://api.spotify.com/v1/me/player', 'GET');
          if (playbackState && playbackState.device && typeof playbackState.device.volume_percent === 'number') {
            setVolume(playbackState.device.volume_percent);
            if (playbackState.device.volume_percent === 0) {
                setIsMuted(true);
            }
          } else {
            console.warn('Could not fetch initial volume, using default or last known.');
          }
        } catch (err) {
          console.error('Failed to fetch initial playback state for volume:', err);
        }
      }
    };
    if (deviceId) {
        fetchCurrentVolumeAndPlayback(); 
    }
  }, [accessToken, deviceId]);

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
            onClick={prevTrack}
            disabled={loading}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Previous track"
          >
            <FaStepBackward />
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
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Next track"
          >
            <FaStepForward />
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
