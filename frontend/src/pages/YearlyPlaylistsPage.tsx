// src/pages/YearlyPlaylistsPage.tsx
import React, { useState, useEffect } from 'react';
import { getPlaylistsByType, getSongsByPlaylistId, ApiPlaylistSummary, ApiPlaylistSong } from '../services/playlist.service';
import TrackRow from '../components/TrackRow'; // Import shared TrackRow
import FilterButtons from '../components/FilterButtons'; // Import FilterButtons component

/**
 * YearlyPlaylistsPage Component
 * Displays yearly playlists with songs by year
 */
const YearlyPlaylistsPage: React.FC = () => {
  // State for playlists data
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<ApiPlaylistSong[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for year selection
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  
  // Fetch playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPlaylistsByType('YEARLY');
        console.log('YearlyPlaylistsPage: Playlists received:', data);
        setPlaylists(data);
        
        console.log('Raw playlists data:', data.map(p => p.name));
        
        // Extract years from playlist names since year property is undefined
        const extractedYears = data.map(playlist => {
          // Try to extract year from playlist name (e.g., "Best of 2023")
          // Using case-insensitive regex and checking for multiple patterns
          const match = playlist.name.match(/best of (\d{4})/i) || playlist.name.match(/(\d{4})/);
          const year = match ? parseInt(match[1], 10) : null;
          console.log(`Extracted year from '${playlist.name}':`, year);
          return year;
        });
        
        // Filter out null values and create unique sorted list
        const years = [...new Set(extractedYears.filter((year): year is number => year !== null))]
          .sort((a, b) => b - a);
        
        console.log('YearlyPlaylistsPage: Final extracted years:', years);
        setAvailableYears(years);
        
        // Set initial active selection to the latest year
        if (years.length > 0) {
          const latestYear = years[0]; // First year in descending sorted list
          setActiveYear(latestYear);
          console.log('YearlyPlaylistsPage: Initial activeYear:', latestYear);
        } else {
          console.log('YearlyPlaylistsPage: No years available from playlists.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load playlists');
        console.error('Error fetching yearly playlists:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaylists();
  }, []);
  
  // Fetch songs when active year changes
  useEffect(() => {
    if (!activeYear) return;
    
    const fetchSongs = async () => {
      setIsLoading(true);
      setPlaylistSongs([]); // Clear previous songs
      console.log(`YearlyPlaylistsPage: Fetching songs for year: ${activeYear}`);
      
      try {
        // Find the playlist ID for the selected year by matching the name pattern
        const selectedPlaylist = playlists.find(p => {
          // Check for pattern like "2023 Year in Review"
          const extractedYear = extractYearFromName(p.name);
          return extractedYear === activeYear;
        });
        console.log('YearlyPlaylistsPage: selectedPlaylist:', selectedPlaylist); // Log the found playlist
        
        if (selectedPlaylist) {
          const songs = await getSongsByPlaylistId(selectedPlaylist.id);
          console.log('YearlyPlaylistsPage: Songs received for selected playlist:', songs); // Log received songs
          setPlaylistSongs(songs);
        } else {
          console.log('YearlyPlaylistsPage: No playlist found for selected year.');
          setPlaylistSongs([]);
        }
      } catch (err) {
        console.error('YearlyPlaylistsPage: Error fetching songs for selected playlist:', err);
        setPlaylistSongs([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, [activeYear, playlists]);
  
  // Helper function to extract year from playlist name
  const extractYearFromName = (playlistName: string): number | null => {
    // Try multiple patterns with case insensitivity
    // 1. "Best of 2023" pattern
    // 2. Any 4-digit year anywhere in the string
    const match = playlistName.match(/best of (\d{4})/i) || playlistName.match(/(\d{4})/);
    if (!match) return null;
    return parseInt(match[1], 10);
  };
  
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Yearly Playlists</h1>
      
      {isLoading && !activeYear ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Year Selector */}
          {availableYears.length > 0 && (
            <FilterButtons
              filters={availableYears.map(String)}
              activeFilter={activeYear ? String(activeYear) : ''}
              onFilterChange={(yearStr) => {
                const year = Number(yearStr);
                setActiveYear(year);
                console.log(`YearlyPlaylistsPage: Year changed to ${year}`);
              }}
              className="mb-8"
            />
          )}
          
          {/* Playlist Songs */}
          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : playlistSongs.length > 0 ? (
              <table className="track-table">
                <thead>
                  <tr>
                    <th>Song</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th className="text-center">Released</th>
                    <th className="text-center">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {playlistSongs.map(song => (
                    <TrackRow key={song.id} track={song} />
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-white/60 text-center py-12">
                No songs found for this playlist.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default YearlyPlaylistsPage;
