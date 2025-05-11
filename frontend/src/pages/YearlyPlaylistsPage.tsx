// src/pages/YearlyPlaylistsPage.tsx
import React, { useState, useEffect } from 'react';
import { getPlaylistsByType, getSongsByPlaylistId, ApiPlaylistSummary, ApiPlaylistSong } from '../services/playlist.service';
import TrackRow from '../components/TrackRow'; // Import shared TrackRow
import TrackTableHeader from '../components/TrackTableHeader'; // Import shared TrackTableHeader

/**
 * YearlyPlaylistsPage Component
 * Displays yearly playlists with album covers and songs by year
 */
const YearlyPlaylistsPage: React.FC = () => {
  // State for playlists data
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<ApiPlaylistSong[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPlaylistsByType('YEARLY');
        setPlaylists(data);
        
        // Set initial selected year to the most recent one
        if (data.length > 0) {
          const years = [...new Set(data.map(playlist => playlist.year || 0))]
            .filter(year => year !== 0)
            .sort((a, b) => b - a);
            
          if (years.length > 0) {
            setSelectedYear(years[0]);
          }
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
  
  // Fetch songs when selected year changes
  useEffect(() => {
    if (!selectedYear) return;
    
    const fetchSongs = async () => {
      setIsLoading(true);
      setPlaylistSongs([]);
      
      try {
        // Find the playlist ID for the selected year
        const selectedPlaylist = playlists.find(p => p.year === selectedYear);
        
        if (selectedPlaylist) {
          const songs = await getSongsByPlaylistId(selectedPlaylist.id);
          setPlaylistSongs(songs);
        } else {
          setPlaylistSongs([]);
        }
      } catch (err) {
        console.error('Error fetching songs for selected year:', err);
        setPlaylistSongs([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, [selectedYear, playlists]);
  
  // Get all available years from playlists
  const availableYears = React.useMemo(() => {
    return [...new Set(playlists.map(playlist => playlist.year || 0))]
      .filter(year => year !== 0)
      .sort((a, b) => b - a);
  }, [playlists]);

  // We can find the selected playlist when needed
  
  return (
    <main className="bg-[rgba(6,7,8,1)] flex flex-col overflow-hidden min-h-screen font-outfit">
      <h1 className="text-5xl text-white font-semibold text-left px-12 py-8 max-md:text-[40px]">
        Yearly Playlists
      </h1>
      
      {/* Year Selector: Horizontal tab selection */}
      <section className="flex h-16 w-full gap-4 px-12 items-center font-outfit">
        {availableYears.map(year => (
          <button
            key={year}
            className={`flex h-10 items-center justify-center px-6 py-2 rounded-full text-sm font-medium tracking-[0.1px] ${
              selectedYear === year
                ? "bg-[rgba(203,203,203,1)] text-black"
                : "bg-transparent text-white hover:bg-white/10"
            }`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </section>
      
      {/* CoverGrid: Album covers grid - with reduced size */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-12 mb-6 max-w-[1400px] overflow-hidden">
        {playlists.map(playlist => (
          <div key={playlist.id} className="aspect-square max-w-[180px] cursor-pointer group relative">
            <img 
              src={playlist.coverImageUrl || 'https://placehold.co/200x200/121212/FFFFFF?text=No+Cover'}
              alt={playlist.name}
              className="w-full h-full object-cover rounded-md shadow-lg transition-transform group-hover:scale-105 duration-200"
              onClick={() => setSelectedYear(playlist.year || null)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2 rounded-md">
              <span className="text-white text-xs font-medium truncate">{playlist.name}</span>
            </div>
          </div>
        ))}
      </section>
      
      {/* TrackTable: Songs table */}
      {selectedYear && (
        <section className="bg-[rgba(6,7,8,1)] w-full max-w-5xl px-0 md:px-4 py-4">
          <table className="w-full min-w-[600px]"> 
            <thead>
              <TrackTableHeader />
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  </td>
                </tr>
              ) : playlistSongs.length > 0 ? (
                playlistSongs.map(song => (
                  <TrackRow key={song.id} track={song} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-white/60 text-center py-12">
                    No songs found for this year.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
};

export default YearlyPlaylistsPage;
