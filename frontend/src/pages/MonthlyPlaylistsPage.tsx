// src/pages/MonthlyPlaylistsPage.tsx
import React, { useState, useEffect } from 'react';
import { getPlaylistsByType, getSongsByPlaylistId, ApiPlaylistSummary, ApiPlaylistSong } from '../services/playlist.service';
import TrackRow from '../components/TrackRow';
import FilterButtons from '../components/FilterButtons';

// Helper to get names of months in order
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/**
 * Monthly Playlists Page Component
 * Displays playlists organized by month, with selectable year/month filtering
 */
const MonthlyPlaylistsPage: React.FC = () => {
  // State for playlists data
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<ApiPlaylistSong[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for year/month selection
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);

  // Fetch playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPlaylistsByType('MONTHLY');
        console.log('MonthlyPlaylistsPage: Playlists received:', data); // Log received playlists
        setPlaylists(data);
        
        // Extract years from playlist names since year property is undefined
        const extractedYears = data.map(playlist => {
          // Try to extract year from playlist name (e.g., "2024 November")
          const match = playlist.name.match(/^(\d{4})/);
          return match ? parseInt(match[1], 10) : null;
        });
        
        // Filter out null values and create unique sorted list
        const years = [...new Set(extractedYears.filter((year): year is number => year !== null))]
          .sort((a, b) => b - a);
        
        console.log('Final extracted years:', years);
        
        setAvailableYears(years);
        
        // Set initial active selection to the latest year and month
        if (years.length > 0) {
          const latestYear = years[0];
          // Get the latest month for this year based on playlist name
          const monthsForYear = getAvailableMonths(latestYear);
          if (monthsForYear.length > 0) {
            const latestMonth = monthsForYear[monthsForYear.length - 1]; // Last month in sorted list
            setActiveYear(latestYear);
            setActiveMonth(latestMonth);
            console.log('MonthlyPlaylistsPage: Initial activeYear:', latestYear, 'Initial activeMonth:', latestMonth);
          }
        } else {
          console.log('MonthlyPlaylistsPage: No years available from playlists.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load playlists');
        console.error('Error fetching monthly playlists:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaylists();
  }, []);

  // Fetch songs when active selection changes
  useEffect(() => {
    if (!activeYear || !activeMonth) return;
    
    const fetchSongs = async () => {
      setIsLoading(true);
      setPlaylistSongs([]); // Clear previous songs
      console.log(`MonthlyPlaylistsPage: Fetching songs for year: ${activeYear}, month: ${activeMonth}`);
      
      try {
        // Find the playlist ID for the selected year/month by matching the name pattern
        const selectedPlaylist = playlists.find(p => {
          // Check for pattern like "2024 November"
          const extractedInfo = extractYearMonth(p.name);
          return extractedInfo && 
                 extractedInfo.year === activeYear && 
                 extractedInfo.month === activeMonth;
        });
        console.log('MonthlyPlaylistsPage: selectedPlaylist:', selectedPlaylist); // Log the found playlist
        
        if (selectedPlaylist) {
          const songs = await getSongsByPlaylistId(selectedPlaylist.id);
          console.log('MonthlyPlaylistsPage: Songs received for selected playlist:', songs); // Log received songs
          // Debug: Log detailed structure of first song to check album data
          if (songs.length > 0) {
            console.log('First song detailed structure:', JSON.stringify(songs[0], null, 2));
          }
          setPlaylistSongs(songs);
        } else {
          console.log('MonthlyPlaylistsPage: No playlist found for selected year/month.');
          setPlaylistSongs([]);
        }
      } catch (err) {
        console.error('MonthlyPlaylistsPage: Error fetching songs for selected playlist:', err);
        setPlaylistSongs([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, [activeYear, activeMonth, playlists]);
  
  // Helper to extract year and month from playlist name
  const extractYearMonth = (playlistName: string): {year: number, month: string} | null => {
    // Match pattern like "2024 November"
    const match = playlistName.match(/^(\d{4})\s+([A-Za-z]+)/);
    if (!match) return null;
    return {
      year: parseInt(match[1], 10),
      month: match[2],
    };
  };
  
  // Get available months for the selected year
  const getAvailableMonths = (year: number): string[] => {
    return playlists
      .map(p => {
        const extracted = extractYearMonth(p.name);
        return extracted && extracted.year === year ? extracted.month : null;
      })
      .filter((month): month is string => month !== null)
      .filter((month, index, self) => self.indexOf(month) === index) // unique values
      .sort((a, b) => {
        // Sort months chronologically
        return monthNames.indexOf(a) - monthNames.indexOf(b);
      });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Monthly Playlists</h1>
      
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
          {availableYears.length>0 && (
            <FilterButtons
              filters={availableYears.map(String)}
              activeFilter={activeYear?String(activeYear):''}
              onFilterChange={(yearStr)=>{
                const year=Number(yearStr);
                setActiveYear(year);
                // When year changes, set month to the first available month of that year
                const months=getAvailableMonths(year);
                if(months.length>0){
                  setActiveMonth(months[0]); 
                  console.log(`MonthlyPlaylistsPage: Year changed to ${year}, activeMonth set to ${months[0]}`);
                } else {
                  setActiveMonth(null); // Or handle as appropriate if no months for year
                  console.log(`MonthlyPlaylistsPage: Year changed to ${year}, no available months.`);
                }
              }}
              className="mb-4"
            />
          )}

          {/* Month Selector */}
          {activeYear && (
            <FilterButtons
              filters={getAvailableMonths(activeYear)}
              activeFilter={activeMonth || ''}
              onFilterChange={(monthName)=>{
                setActiveMonth(monthName);
                console.log(`MonthlyPlaylistsPage: Month changed to ${monthName}`);
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

export default MonthlyPlaylistsPage;
