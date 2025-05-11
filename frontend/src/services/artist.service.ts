// src/services/artist.service.ts
import axios from 'axios';
import { ApiPlaylistSong } from './playlist.service';

// Structure for the list view (matches ArtistResponseDto)
export interface ApiArtist {
  id: string;
  name: string;
  monthlyFeatures: number;
  yearlyFeatures: number;
  bestOfSongs: number;
}

// Structure for the detailed artist response
export interface ApiArtistDetail extends ApiArtist {
  bio?: string; // Artist biography
  featuredSongs: ApiPlaylistSong[]; // Featured songs by this artist
}

// Get the API base URL from environment variables (defined in .env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Fetches all artists from the backend API.
 * @returns A promise that resolves to an array of ApiArtist objects.
 * @throws Will throw an error if the API request fails.
 */
export const getAllArtists = async (): Promise<ApiArtist[]> => {
  try {
    const response = await axios.get<ApiArtist[]>(`${API_BASE_URL}/artists`);
    return response.data;
  } catch (error) {
    console.error('Error fetching artists:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching artists.');
  }
};

/**
 * Fetches a single artist by ID from the backend API.
 * @param artistId The ID of the artist to fetch.
 * @returns A promise that resolves to an ApiArtistDetail object.
 * @throws Will throw an error if the API request fails.
 */
export const getArtistById = async (artistId: string): Promise<ApiArtistDetail> => {
  try {
    const response = await axios.get<ApiArtistDetail>(`${API_BASE_URL}/artists/${artistId}`);
    
    // Transform the response if necessary to match our expected interface
    const artistData = response.data;
    
    // If the API returns songs instead of featuredSongs, rename the property
    if ('songs' in artistData && !('featuredSongs' in artistData)) {
      return {
        ...artistData,
        featuredSongs: (artistData as any).songs || []
      };
    }
    
    return artistData;
  } catch (error) {
    console.error(`Error fetching artist with ID ${artistId}:`, error);
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`An unexpected error occurred while fetching artist details.`);
  }
};
