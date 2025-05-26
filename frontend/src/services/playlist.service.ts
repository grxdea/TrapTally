// src/services/playlist.service.ts
import axios from 'axios';

// Type matching PlaylistSummaryDto from backend
export interface ApiPlaylistSummary {
  id: string;
  name: string;
  coverImageUrl: string;
  spotifyUrl: string;
  year?: number | null;
  month?: number | null;
}

// Type matching PlaylistSongDto from backend
export interface ApiPlaylistSong {
  id: string; // Song ID
  title: string;
  coverImageUrl: string;
  spotifyUrl: string;
  releaseYear: number;
  releaseMonth?: number | null;
  artists: { id: string; name: string }[];
  spotifyTrackId: string; // Needed for playback URI
  album?: { 
    id: string;
    name: string;
  } | null;
}

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('Using API_BASE_URL:', API_BASE_URL);

/**
 * Fetches playlists by their type from the backend API.
 * @param type The type of playlist ('YEARLY', 'MONTHLY', 'ARTIST').
 * @returns A promise that resolves to an array of ApiPlaylistSummary objects.
 */
// Helper function to add retry logic to API calls
const apiCallWithRetry = async <T>(apiCall: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      console.warn(`API call failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // Don't wait on the last attempt
      if (attempt < maxRetries) {
        // Use exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError; // If we get here, all retries failed
};

export const getPlaylistsByType = async (type: 'YEARLY' | 'MONTHLY' | 'ARTIST'): Promise<ApiPlaylistSummary[]> => {
  const typeEndpoint = type.toLowerCase(); // Convert type to endpoint path (e.g., 'yearly')
  
  return apiCallWithRetry(async () => {
    try {
      const response = await axios.get<ApiPlaylistSummary[]>(`${API_BASE_URL}/playlists/${typeEndpoint}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${type} playlists:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`An unexpected error occurred while fetching ${type} playlists.`);
    }
  });
};

/**
 * Fetches all songs for a specific playlist ID from the backend API.
 * @param playlistId The internal database ID of the playlist.
 * @returns A promise that resolves to an array of ApiPlaylistSong objects.
 */
export const getSongsByPlaylistId = async (playlistId: string): Promise<ApiPlaylistSong[]> => {
  return apiCallWithRetry(async () => {
    try {
      const response = await axios.get<ApiPlaylistSong[]>(`${API_BASE_URL}/playlists/${playlistId}/songs`);
      console.log(`API Response for playlist ${playlistId}:`, response.data);
      if (response.data && response.data.length > 0) {
        // Check if album property exists and what format it has
        console.log('Album property format check:', {
          firstSong: response.data[0],
          hasAlbumProperty: response.data[0].hasOwnProperty('album'),
          albumValue: response.data[0].album,
          albumType: response.data[0].album ? typeof response.data[0].album : 'undefined'
        });
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching songs for playlist ${playlistId}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`An unexpected error occurred while fetching playlist songs.`);
    }
  });
};
