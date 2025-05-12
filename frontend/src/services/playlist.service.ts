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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('Using API_BASE_URL:', API_BASE_URL);

/**
 * Fetches playlists by their type from the backend API.
 * @param type The type of playlist ('YEARLY', 'MONTHLY', 'ARTIST').
 * @returns A promise that resolves to an array of ApiPlaylistSummary objects.
 */
export const getPlaylistsByType = async (type: 'YEARLY' | 'MONTHLY' | 'ARTIST'): Promise<ApiPlaylistSummary[]> => {
  const typeEndpoint = type.toLowerCase(); // Convert type to endpoint path (e.g., 'yearly')
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
};

/**
 * Fetches all songs for a specific playlist ID from the backend API.
 * @param playlistId The internal database ID of the playlist.
 * @returns A promise that resolves to an array of ApiPlaylistSong objects.
 */
export const getSongsByPlaylistId = async (playlistId: string): Promise<ApiPlaylistSong[]> => {
  try {
    const response = await axios.get<ApiPlaylistSong[]>(`${API_BASE_URL}/playlists/${playlistId}/songs`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching songs for playlist ${playlistId}:`, error);
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`An unexpected error occurred while fetching playlist songs.`);
  }
};
