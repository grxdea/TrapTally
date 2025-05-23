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
  imageUrl?: string; // Artist profile image URL
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
    const response = await axios.get<any[]>(`${API_BASE_URL}/artists`);
    
    // Log the first raw artist object to inspect its structure
    if (response.data && response.data.length > 0) {
      console.log('Inspecting first raw artist object from API:', response.data[0]);
    }
    
    // Map the response data to ensure consistent property names
    const artists = response.data.map(artist => {
      // Check for various possible image URL properties in the API response
      const imageUrl = artist.imageUrl || 
                      artist.profileImageUrl || 
                      artist.image || 
                      artist.profileImage || 
                      artist.coverImageUrl || 
                      artist.avatarUrl || 
                      artist.avatar || 
                      `https://placehold.co/300x300/121212/FFFFFF?text=${encodeURIComponent(artist.name || 'Artist')}`;
                      
      // Only log in development environment to reduce console clutter
      if (import.meta.env.DEV) {
        if (imageUrl && !imageUrl.includes('placehold.co')) {
          console.debug(`Found image URL for artist ${artist.name}:`, imageUrl);
        } else if (imageUrl.includes('placehold.co')) {
          console.debug(`Using placeholder image for artist ${artist.name}`);
        }
      }
      
      // Return a properly structured artist object
      return {
        ...artist,
        imageUrl
      };
    });
    
    return artists;
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
    const response = await axios.get<any>(`${API_BASE_URL}/artists/${artistId}`);
    
    // Get the raw artist data from the response
    const rawData = response.data;
    
    // Check for various possible image URL properties in the API response
    const imageUrl = rawData.imageUrl || 
                   rawData.profileImageUrl || 
                   rawData.image || 
                   rawData.profileImage || 
                   rawData.coverImageUrl || 
                   rawData.avatarUrl || 
                   rawData.avatar || 
                   null;
    
    // Log the found image URL for debugging
    if (imageUrl) {
      console.log(`Found image URL for artist ${rawData.name}:`, imageUrl);
    } else {
      console.log(`No image URL found for artist ${rawData.name}`);
    }
    
    // Determine featured songs correctly based on API response
    let featuredSongs: ApiPlaylistSong[] = [];
    if ('featuredSongs' in rawData) {
      featuredSongs = rawData.featuredSongs || [];
    } else if ('songs' in rawData) {
      featuredSongs = rawData.songs || [];
    }
    
    // Create a properly structured artist detail object
    const artistData: ApiArtistDetail = {
      id: rawData.id,
      name: rawData.name,
      monthlyFeatures: rawData.monthlyFeatures || 0,
      yearlyFeatures: rawData.yearlyFeatures || 0,
      bestOfSongs: rawData.bestOfSongs || 0,
      imageUrl: imageUrl,
      bio: rawData.bio || '',
      featuredSongs: featuredSongs
    };
    
    return artistData;
  } catch (error) {
    console.error(`Error fetching artist with ID ${artistId}:`, error);
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`An unexpected error occurred while fetching artist details.`);
  }
};
