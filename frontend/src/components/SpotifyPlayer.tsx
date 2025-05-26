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
  const hasAttemptedInitRef = useRef(false);
  const sdkReadyCallbackSetRef = useRef(false);
  const lastAttemptTimeRef = useRef<number>(0);

  const initializePlayer = useCallback(() => {
    console.log('SpotifyPlayer: Attempting initializePlayer...');
    console.log(`SpotifyPlayer: initializePlayer - accessToken: ${accessToken ? 'present' : 'absent'}, window.Spotify: ${window.Spotify ? 'present' : 'absent'}`);

    if (player) {
      console.log('SpotifyPlayer: initializePlayer - Player already initialized. Bailing.');
      return;
    }
    if (hasAttemptedInitRef.current && Date.now() - lastAttemptTimeRef.current < 5000) {
      console.log('SpotifyPlayer: initializePlayer - Debounced (called within 5s of last attempt). Bailing.');
      return;
    }
    if (!accessToken || !window.Spotify) {
      console.error('SpotifyPlayer: initializePlayer - Missing accessToken or window.Spotify. Bailing.');
      return;
    }

    console.log('SpotifyPlayer: initializePlayer - Proceeding with SDK setup.');
    hasAttemptedInitRef.current = true;
    lastAttemptTimeRef.current = Date.now();

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Trap Tally Web Player',
      getOAuthToken: (cb: (token: string) => void) => {
        console.log('SpotifyPlayer: getOAuthToken called by SDK.');
        const currentTokenFromStore = usePlaybackStore.getState().spotifyUserTokens?.accessToken;
        if (!currentTokenFromStore) {
          console.error('SpotifyPlayer: getOAuthToken - No access token found in store for SDK!');
          return;
        }
        console.log(`SpotifyPlayer: getOAuthToken - Providing token: ${currentTokenFromStore.substring(0,5)}...`);
        cb(currentTokenFromStore);
      },
      volume: 0.5,
    });

    spotifyPlayer.addListener('ready', async ({ device_id }: { device_id: string }) => {
      console.log('SpotifyPlayer: SDK Event - Ready with Device ID', device_id);
      setDeviceId(device_id);
      setSpotifyPlayerReady(true);
      try {
        const currentToken = usePlaybackStore.getState().spotifyUserTokens?.accessToken;
        if (!currentToken) {
          console.error('SpotifyPlayer: Cannot transfer playback, no token available.');
          return;
        }
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ device_ids: [device_id], play: false })
        });
        console.log('SpotifyPlayer: Transferred playback to SDK device');
      } catch (err) {
        console.error('SpotifyPlayer: Failed to transfer playback', err);
      }
      setPlayer(spotifyPlayer);
    });

    spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('SpotifyPlayer: SDK Event - Device ID has gone offline', device_id);
      setSpotifyPlayerReady(false);
      setDeviceId(null);
    });

    spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: SDK Event - Failed to initialize -', message);
      hasAttemptedInitRef.current = false;
    });
    
    spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: SDK Event - Failed to authenticate -', message);
      hasAttemptedInitRef.current = false;
      
      if (message.toLowerCase().includes('premium')) {
        console.log('SpotifyPlayer: Premium account required for Web Playback SDK');
        setIsPremiumRequired(true);
      } else {
        console.log('SpotifyPlayer: Authentication error, attempting to refresh auth state.');
        import('../utils/authUtils')
          .then(({ refreshAuthState }) => refreshAuthState())
          .catch(err => console.error('SpotifyPlayer: Failed to refresh auth:', err));
      }
    });
    
    spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: SDK Event - Failed to validate Spotify account -', message);
      setIsPremiumRequired(true);
    });
    
    spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
      console.error('SpotifyPlayer: SDK Event - Playback error -', message);
      if (message.toLowerCase().includes('premium')) {
        setIsPremiumRequired(true);
      }
    });

    spotifyPlayer.addListener('player_state_changed', (state: any) => {
      if (!state) {
        console.warn('SpotifyPlayer: SDK Event - Received null state from player_state_changed');
        return;
      }
      console.log('SpotifyPlayer: SDK Event - Player state changed');
      setPlaybackSdkState(state);
    });

    console.log('SpotifyPlayer: Calling spotifyPlayer.connect()...');
    spotifyPlayer.connect()
      .then((success: boolean) => {
        if (!success) {
          console.error('SpotifyPlayer: Connect call returned false—Premium required or invalid token/setup');
          setIsPremiumRequired(true);
          hasAttemptedInitRef.current = false;
        } else {
          console.log('SpotifyPlayer: Connect call successful.');
        }
      })
      .catch((err: any) => {
        console.error('SpotifyPlayer: Error during spotifyPlayer.connect():', err);
        if (err && typeof err.message === 'string' && err.message.toLowerCase().includes('premium')) {
          setIsPremiumRequired(true);
        }
        hasAttemptedInitRef.current = false;
      });
  }, [accessToken, player, setSpotifyPlayerReady, setDeviceId, setPlaybackSdkState]);

  useEffect(() => {
    const currentToken = usePlaybackStore.getState().spotifyUserTokens?.accessToken;
    console.log('SpotifyPlayer: useEffect for SDK setup running...');
    console.log(`SpotifyPlayer: useEffect - accessToken (from hook): ${accessToken ? 'present' : 'absent'}, accessToken (direct store check): ${currentToken ? 'present' : 'absent'}, window.Spotify: ${window.Spotify ? 'present' : 'absent'}, sdkReadyCallbackSetRef: ${sdkReadyCallbackSetRef.current}`);

    if (sdkReadyCallbackSetRef.current && window.Spotify && player) {
      console.log('SpotifyPlayer: useEffect - SDK callback already set, Spotify ready, and player exists. Assuming initialized or in progress. Returning.');
      return;
    }

    if (!sdkReadyCallbackSetRef.current) {
      console.log('SpotifyPlayer: useEffect - sdkReadyCallbackSetRef is false. Setting it true and proceeding with SDK setup logic.');
      sdkReadyCallbackSetRef.current = true;

      if (window.Spotify) {
        console.log('SpotifyPlayer: useEffect - window.Spotify is present.');
        const tokenForInit = usePlaybackStore.getState().spotifyUserTokens?.accessToken;
        if (tokenForInit) {
          console.log('SpotifyPlayer: useEffect - accessToken is present (checked again), calling initializePlayer.');
          initializePlayer();
        } else {
          console.warn('SpotifyPlayer: useEffect - window.Spotify present, but no accessToken (checked again). Player not initialized yet.');
        }
      } else {
        console.log('SpotifyPlayer: useEffect - window.Spotify is NOT present. Setting onSpotifyWebPlaybackSDKReady callback.');
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log('SpotifyPlayer: window.onSpotifyWebPlaybackSDKReady (assigned by SpotifyPlayer.tsx useEffect) fired.');
          const tokenAtSdkReady = usePlaybackStore.getState().spotifyUserTokens?.accessToken;
          console.log(`SpotifyPlayer: SDKReadyCallback - accessToken (at SDK ready): ${tokenAtSdkReady ? 'present' : 'absent'}`);
          if (tokenAtSdkReady) {
            console.log('SpotifyPlayer: SDKReadyCallback - accessToken present, calling initializePlayer.');
            initializePlayer();
          } else {
            console.warn('SpotifyPlayer: SDKReadyCallback - no accessToken when SDK became ready. Player not initialized.');
          }
        };
      }
    } else {
      console.log('SpotifyPlayer: useEffect - sdkReadyCallbackSetRef was true, but player not fully initialized. Checking if re-init is needed.');
      const tokenForReInit = usePlaybackStore.getState().spotifyUserTokens?.accessToken;
      if (window.Spotify && tokenForReInit && !player) {
        console.log('SpotifyPlayer: useEffect - Attempting re-initialization as player is missing but conditions seem met.');
        initializePlayer();
      }
    }

    return () => {
      console.log('SpotifyPlayer: useEffect cleanup. Disconnecting player if exists.');
      if (player) {
        player.disconnect();
        console.log('SpotifyPlayer: Player disconnected during cleanup.');
      }
    };
  }, [accessToken, initializePlayer, player]);

  useEffect(() => {
    if (!accessToken) return;
    
    if (accessToken === 'backend-managed-token') {
      console.log('SpotifyPlayer: Detected placeholder token, attempting to refresh auth');
      import('../utils/authUtils')
        .then(({ refreshAuthState }) => refreshAuthState())
        .catch(err => console.error('SpotifyPlayer: Failed to refresh auth for placeholder token:', err));
    }
  }, [accessToken]);

  return (
    <div className="container mx-auto">
      {isPremiumRequired && (
        <div className="p-4 my-4 bg-red-900/30 text-white rounded-md">
          <h3 className="font-medium text-lg">Spotify Premium Required</h3>
          <p className="mt-2">
            The Spotify Web Playback SDK requires a Spotify Premium subscription.
            Please upgrade your Spotify account to use the player.
          </p>
        </div>
      )}
      
      {!accessToken && (
        <div className="p-4 my-4 bg-gray-800 text-white rounded-md">
          <p>Please log in with Spotify to use the player.</p>
        </div>
      )}
      
      {showDebugInfo && (
        <div className="p-4 my-4 bg-gray-800 text-white rounded-md text-sm font-mono">
          <h3 className="font-medium mb-2">Debug Info</h3>
          <p>Access Token: {accessToken ? `${accessToken.substring(0, 5)}...${accessToken.substring(accessToken.length - 5)}` : 'None'}</p>
          <p>Player Initialized (component state): {player ? 'Yes' : 'No'}</p>
          <p>Device ID (from store): {usePlaybackStore.getState().deviceId || 'None'}</p>
          <p>Spotify Player Ready (from store): {usePlaybackStore.getState().isSpotifyPlayerReady ? 'Yes' : 'No'}</p>
          <p>Has Attempted Init (ref): {hasAttemptedInitRef.current ? 'Yes' : 'No'}</p>
          <p>SDK Callback Set (ref): {sdkReadyCallbackSetRef.current ? 'Yes' : 'No'}</p>
          <button 
            onClick={() => {
              console.log('SpotifyPlayer: Force Reinitialize button clicked.');
              hasAttemptedInitRef.current = false;
              lastAttemptTimeRef.current = 0;
              if (player) {
                console.log('SpotifyPlayer: Disconnecting existing player before force reinitialize...');
                player.disconnect();
                setPlayer(null);
              }
              setSpotifyPlayerReady(false);
              setDeviceId(null);
              setTimeout(() => initializePlayer(), 100);
            }}
            className="mt-2 px-3 py-1 bg-blue-600 rounded-md text-white text-xs"
          >
            Force Reinitialize Player
          </button>
        </div>
      )}
      
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="text-xs text-gray-400 hover:text-white"
        >
          {showDebugInfo ? 'Hide Debug' : 'Show Debug Info'}
        </button>
      </div>
      
      {player && usePlaybackStore.getState().deviceId && <SpotifyPlayerControls />}
    </div>
  );
};

export default SpotifyPlayer;
