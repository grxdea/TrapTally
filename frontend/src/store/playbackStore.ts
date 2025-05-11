// src/store/playbackStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware'; // Optional: for debugging and persistence

// Define the shape of the tokens object we'll receive and store
export interface SpotifyTokens {
  accessToken: string;
  refreshToken?: string; // Optional, but good to store if available
  expiresIn?: number;    // Optional, in seconds
  receivedAt?: number;   // Optional, timestamp when tokens were received (ms)
}



// Define the shape of the state
interface PlaybackState {
  spotifyUserTokens: SpotifyTokens | null; // Stores the structured token object
  deviceId: string | null;                // Spotify device ID for playback
  isPlaying: boolean;
  currentTrackId: string | null;          // Spotify Track ID (e.g., 'spotify:track:...')
  isSpotifyPlayerReady: boolean;          // Is the Spotify Web Playback SDK player ready?
  playbackSdkState: any | null;           // Stores the state object from Spotify SDK's player_state_changed

  // Actions to update the state
  setSpotifyTokens: (tokens: SpotifyTokens | null) => void; // For login
  clearSpotifyTokens: () => void;                      // For logout or error
  setDeviceId: (deviceId: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTrackId: (currentTrackId: string | null) => void;
  setSpotifyPlayerReady: (isReady: boolean) => void;
  setPlaybackSdkState: (state: any | null) => void;
}

// Create the Zustand store
export const usePlaybackStore = create<PlaybackState>()(
  devtools(
    persist( // Persist state in localStorage
      (set) => ({
        // Initial state
        spotifyUserTokens: null,
        deviceId: null,
        isPlaying: false,
        currentTrackId: null,
        isSpotifyPlayerReady: false,
        playbackSdkState: null,

        // Actions implementation
        setSpotifyTokens: (tokens) => {
          if (tokens) {
            set({ spotifyUserTokens: { ...tokens, receivedAt: Date.now() } });
          } else {
            set({ spotifyUserTokens: null });
          }
        },
        clearSpotifyTokens: () => set({ spotifyUserTokens: null, isPlaying: false, currentTrackId: null, playbackSdkState: null, isSpotifyPlayerReady: false, deviceId: null }), // Also clear player related state on logout
        setDeviceId: (deviceId) => set({ deviceId }),
        setIsPlaying: (isPlaying) => set({ isPlaying }),
        setCurrentTrackId: (currentTrackId) => set({ currentTrackId }),
        setSpotifyPlayerReady: (isReady) => set({ isSpotifyPlayerReady: isReady }),
        setPlaybackSdkState: (state) => set({ playbackSdkState: state }),
      }),
      {
        name: 'trap-tally-playback-storage', // Name for the persisted storage
        // getStorage: () => sessionStorage, // Optional: use sessionStorage instead of localStorage
      }
    )
  )
);

// Selector hooks (optional but convenient)
export const selectSpotifyUserTokens = (state: PlaybackState) => state.spotifyUserTokens;
export const selectSpotifyAccessToken = (state: PlaybackState) => state.spotifyUserTokens?.accessToken ?? null;
export const selectDeviceId = (state: PlaybackState) => state.deviceId;
export const selectIsPlaying = (state: PlaybackState) => state.isPlaying;
export const selectCurrentTrackId = (state: PlaybackState) => state.currentTrackId;
export const selectIsSpotifyPlayerReady = (state: PlaybackState) => state.isSpotifyPlayerReady;
export const selectPlaybackSdkState = (state: PlaybackState) => state.playbackSdkState;

// A selector to determine if the user is authenticated based on token presence
export const selectIsUserAuthenticated = (state: PlaybackState) => !!state.spotifyUserTokens?.accessToken;
