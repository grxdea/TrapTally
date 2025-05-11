import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePlaybackStore, selectSpotifyAccessToken } from '../store/playbackStore';
import SpotifyPlayerControls from './SpotifyPlayerControls';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

const SpotifyPlayer: React.FC = () => {
  const accessToken = usePlaybackStore(selectSpotifyAccessToken);
  const { setSpotifyPlayerReady, setDeviceId, setPlaybackSdkState } = usePlaybackStore();
  const [player, setPlayer] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);
  
  // Use refs to enforce initialization lifecycle without causing re-renders
  const hasAttemptedInitRef = useRef(false);
  const sdkReadyCallbackSetRef = useRef(false);

  // Check if the token is expired
  const isTokenExpired = useCallback(() => {
    const tokens = usePlaybackStore.getState().spotifyUserTokens;
    if (!tokens || !tokens.receivedAt || !tokens.expiresIn) return true;
    
    const expiresAtMs = tokens.receivedAt + (tokens.expiresIn * 1000);
    // Add 5-minute buffer to prevent edge cases
    return Date.now() > (expiresAtMs - (5 * 60 * 1000));
  }, []);

  // Reset the initialization state - useful for retry
  const resetPlayerInitialization = useCallback(() => {
    console.log('SpotifyPlayer: Resetting player initialization state');
    hasAttemptedInitRef.current = false;
    
    if (player) {
      console.log('SpotifyPlayer: Disconnecting existing player before reset');
      player.disconnect();
      setPlayer(null);
      setDeviceId(null);
      setSpotifyPlayerReady(false);
    }
  }, [player, setDeviceId, setSpotifyPlayerReady]);

  // Initialize the player - defined outside of effects but not dependent on state that changes frequently
  const initializePlayer = useCallback(() => {
    // Safety check - only initialize once
    if (hasAttemptedInitRef.current || player) {
      console.log('SpotifyPlayer: Initialization already attempted or player exists.');
      return;
    }

    if (!accessToken || !window.Spotify) {
      console.log('SpotifyPlayer: Access token or Spotify SDK not available yet.');
      return;
    }

    // Mark that we've attempted initialization
    hasAttemptedInitRef.current = true;
    console.log('SpotifyPlayer: Initializing player...');

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Trap Tally Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        // The SDK expects the token directly, ensure accessToken is not null
        if (accessToken) {
            console.log('SpotifyPlayer: Providing token to Spotify SDK');
            cb(accessToken);
        } else {
            console.error("SpotifyPlayer: accessToken is null in getOAuthToken. This shouldn't happen.");
        }
      },
      volume: 0.5,
    });

    // Error handling
    spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: Failed to initialize -', message);
      hasAttemptedInitRef.current = false; // Allow retry on initialization error
    });
    
    spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: Failed to authenticate -', message);
      // We might need to get a new token
      hasAttemptedInitRef.current = false; // Allow retry after auth error
      
      // Check if the error is related to not having a Premium account
      if (message.toLowerCase().includes('premium') || message.includes('401')) {
        console.log('SpotifyPlayer: Premium account required for Web Playback SDK');
        setIsPremiumRequired(true);
      }
    });
    
    spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: Failed to validate Spotify account -', message);
      // This usually means the user needs to have a premium account
      setIsPremiumRequired(true);
    });
    
    spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: Playback error -', message);
      
      // Check if the error is related to not having a Premium account
      if (message.toLowerCase().includes('premium')) {
        setIsPremiumRequired(true);
      }
    });

    // Playback status updates
    spotifyPlayer.addListener('player_state_changed', (state: any) => {
      if (!state) {
        console.warn('SpotifyPlayer: Received null state from player_state_changed');
        return;
      }
      console.log('SpotifyPlayer: Player state changed');
      setPlaybackSdkState(state);
    });

    // Ready
    spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('SpotifyPlayer: Ready with Device ID', device_id);
      setDeviceId(device_id);
      setSpotifyPlayerReady(true);
      setPlayer(spotifyPlayer);
    });

    // Not Ready
    spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('SpotifyPlayer: Device ID has gone offline', device_id);
      setSpotifyPlayerReady(false);
      setDeviceId(null);
    });

    // Connect to the player!
    console.log('SpotifyPlayer: Attempting to connect to Spotify...');
    spotifyPlayer.connect()
      .then((success: boolean) => {
        if (success) {
          console.log('SpotifyPlayer: Successfully connected to Spotify!');
        } else {
          console.error('SpotifyPlayer: Failed to connect to Spotify - Please check your Spotify Premium status');
          console.log('SpotifyPlayer: A Spotify Premium account is required for Web Playback');
          setIsPremiumRequired(true);
          hasAttemptedInitRef.current = false; // Allow retry on connection failure
        }
      })
      .catch((error: any) => {
        console.error('SpotifyPlayer: Error connecting to Spotify:', error);
        
        // Check if the error is related to Premium account
        const errorMessage = error?.message || String(error);
        if (errorMessage.toLowerCase().includes('premium') || errorMessage.includes('401')) {
          console.log('SpotifyPlayer: A Spotify Premium account is required for Web Playback');
          setIsPremiumRequired(true);
        } else {
          console.log('SpotifyPlayer: This may be due to network issues or an expired token');
        }
        
        hasAttemptedInitRef.current = false; // Allow retry on connection error
      });

  }, [accessToken, player, setSpotifyPlayerReady, setDeviceId, setPlaybackSdkState]);

  // Set up SDK ready callback ONCE when component mounts
  useEffect(() => {
    // Don't set up SDK callback if it's already been done
    if (sdkReadyCallbackSetRef.current) {
      return;
    }
    
    // Mark that we've set up the callback
    sdkReadyCallbackSetRef.current = true;
    
    // If SDK is already loaded, initialize player
    if (window.Spotify) {
      console.log('SpotifyPlayer: Spotify SDK already loaded at mount time.');
      // Only initialize if we have an access token
      if (accessToken) {
        initializePlayer();
      }
    } else {
      // SDK not loaded yet, set up callback for when it loads
      console.log('SpotifyPlayer: Setting up onSpotifyWebPlaybackSDKReady callback.');
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('SpotifyPlayer: SDK now ready via callback.');
        // Only initialize if we have an access token
        if (accessToken) {
          initializePlayer();
        }
      };
    }

    // Cleanup
    return () => {
      // Disconnect player if it exists
      if (player) {
        console.log('SpotifyPlayer: Disconnecting player on unmount.');
        player.disconnect();
        setPlayer(null);
        setDeviceId(null);
        setSpotifyPlayerReady(false);
      }
      
      // Clean up SDK ready callback
      window.onSpotifyWebPlaybackSDKReady = () => {};
    };
    // We only want this to run once on mount, and once on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle changes to access token
  useEffect(() => {
    // Only attempt initialization if:
    // 1. We have an access token
    // 2. We haven't attempted initialization yet
    // 3. The Spotify SDK is loaded
    // 4. We don't already have a player
    if (accessToken && !hasAttemptedInitRef.current && window.Spotify && !player) {
      // Check if token is expired before attempting to initialize
      if (isTokenExpired()) {
        console.log('SpotifyPlayer: Token is expired, need to refresh token');
        // Reset player state to allow for re-authentication
        resetPlayerInitialization();
        // You might want to redirect to login or implement a token refresh here
        return;
      }
      console.log('SpotifyPlayer: Access token valid, initializing player.');
      initializePlayer();
    }
  }, [accessToken, player, initializePlayer, isTokenExpired, resetPlayerInitialization]);

  return (
    <div className="bg-black/20 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 mb-8">
      {/* Player Status Area */}
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-xl font-medium text-white">Spotify Player</h2>
        <button 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="text-xs text-white/60 hover:text-white border border-white/20 rounded-full px-3 py-1 transition-colors"
        >
          {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>
      
      {showDebugInfo && (
        <div className="mx-6 mb-6 text-xs text-white/70 bg-white/5 p-4 rounded-lg">
          <p>Access Token: {accessToken ? 'Present' : 'Missing'}</p>
          <p>Player Initialized: {hasAttemptedInitRef.current ? 'Yes' : 'No'}</p>
          <p>Player Connected: {player ? 'Yes' : 'No'}</p>
          <button 
            onClick={resetPlayerInitialization}
            className="mt-3 px-3 py-1 bg-spotify-green/90 text-black rounded-full hover:bg-spotify-green transition-colors text-xs"
          >
            Reset Player
          </button>
        </div>
      )}
      
      {/* Player Content */}
      <div className={`${showDebugInfo ? '' : 'px-6 pb-6'}`}>
        {!accessToken && (
          <div className="p-4 text-center text-white/70 text-sm">
            <p>Please log in with Spotify to use the player.</p>
          </div>
        )}
        
        {accessToken && !player && (
          <div className="p-4 text-center text-white/70">
            {isPremiumRequired ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-spotify-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Spotify Premium Required</p>
                <p className="text-sm">The Web Playback SDK requires a Spotify Premium subscription.</p>
                <div className="flex flex-col space-y-2">
                  <a 
                    href="https://www.spotify.com/premium/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mx-auto px-4 py-2 bg-spotify-green text-black font-medium rounded-full hover:bg-spotify-green/90 transition-colors text-sm"
                  >
                    Learn About Premium
                  </a>
                  <button 
                    onClick={resetPlayerInitialization}
                    className="inline-block mx-auto px-4 py-2 bg-transparent border border-white/20 text-white/80 font-medium rounded-full hover:bg-white/10 transition-colors text-sm"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="animate-pulse flex space-x-4 justify-center items-center">
                  <svg className="h-10 w-10 text-spotify-green animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p>Initializing Spotify Player...</p>
                </div>
                {hasAttemptedInitRef.current && (
                  <button 
                    onClick={resetPlayerInitialization}
                    className="mt-6 px-4 py-2 bg-spotify-green text-black font-medium rounded-full hover:bg-spotify-green/90 transition-colors text-sm"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {player && <SpotifyPlayerControls />}
      </div>
    </div>
  );
};

export default SpotifyPlayer;
