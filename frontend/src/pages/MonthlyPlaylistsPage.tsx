// src/pages/MonthlyPlaylistsPage.tsx
import React, { useState, useEffect } from 'react';
import { getPlaylistsByType, getSongsByPlaylistId, ApiPlaylistSummary, ApiPlaylistSong } from '../services/playlist.service';
import TrackRow from '../components/TrackRow';

// Define the structure for an active selection
interface ActiveSelection {
  year: number;
  month: number;
}

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
  const [activeSelection, setActiveSelection] = useState<ActiveSelection | null>(null);

  // Fetch playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPlaylistsByType('MONTHLY');
        setPlaylists(data);
        
        // Extract unique years from the playlists
        const years = [...new Set(data.map(playlist => playlist.year || 0))]
          .filter(year => year !== 0)
          .sort((a, b) => b - a);
        
        setAvailableYears(years);
        
        // Set initial active selection to the latest year and month
        if (years.length > 0) {
          const latestYear = years[0];
          const latestMonth = Math.max(
            ...data
              .filter(playlist => playlist.year === latestYear)
              .map(playlist => playlist.month || 0)
          );
          
          setActiveSelection({
            year: latestYear,
            month: latestMonth
          });
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
    if (!activeSelection) return;
    
    const fetchSongs = async () => {
      setIsLoading(true);
      setPlaylistSongs([]);
      
      try {
        // Find the playlist ID for the selected year/month
        const selectedPlaylist = playlists.find(
          p => p.year === activeSelection.year && p.month === activeSelection.month
        );
        
        if (selectedPlaylist) {
          const songs = await getSongsByPlaylistId(selectedPlaylist.id);
          setPlaylistSongs(songs);
        } else {
          setPlaylistSongs([]);
        }
      } catch (err) {
        console.error('Error fetching songs for selected playlist:', err);
        setPlaylistSongs([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, [activeSelection, playlists]);
  
  // Handler for year/month selection
  const handleSelectionChange = (year: number, month: number) => {
    setActiveSelection({ year, month });
  };
  
  // Get available months for the selected year
  const getAvailableMonths = (year: number): number[] => {
    return playlists
      .filter(playlist => playlist.year === year && playlist.month !== null)
      .map(playlist => playlist.month as number)
      .sort((a, b) => a - b);
  };
  
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Monthly Playlists</h1>
      
      {isLoading && !activeSelection ? (
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
            <div className="year-selector">
              {availableYears.map(year => (
                <button
                  key={year}
                  className={`year-button ${activeSelection?.year === year ? 'active' : ''}`}
                  onClick={() => {
                    // Get the first available month for this year
                    const months = getAvailableMonths(year);
                    if (months.length > 0) {
                      handleSelectionChange(year, months[0]);
                    }
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
          
          {/* Month Selector (if year selected) */}
          {activeSelection && (
            <div className="year-selector mb-8">
              {getAvailableMonths(activeSelection.year).map(month => {
                // Convert numeric month to name
                const monthNames = ["January", "February", "March", "April", "May", "June", 
                                   "July", "August", "September", "October", "November", "December"];
                return (
                  <button
                    key={month}
                    className={`year-button ${activeSelection.month === month ? 'active' : ''}`}
                    onClick={() => handleSelectionChange(activeSelection.year, month)}
                  >
                    {monthNames[month - 1]}
                  </button>
                );
              })}
            </div>
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
