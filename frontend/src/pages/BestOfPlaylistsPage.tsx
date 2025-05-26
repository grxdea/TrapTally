    // src/pages/BestOfPlaylistsPage.tsx
import React, { useState, useEffect } from 'react';
import { getPlaylistsByType, getSongsByPlaylistId, ApiPlaylistSummary, ApiPlaylistSong } from '../services/playlist.service';
import PlaylistSelectorCard from '../components/PlaylistSelectorCard'; // Import the new card selector
import TrackTableHeader from '../components/TrackTableHeader';
import TrackRow from '../components/TrackRow';

/**
 * Component for the Best Of (Artist) Playlists page.
 */
const BestOfPlaylistsPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  // State for the ID of the currently selected playlist
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [songs, setSongs] = useState<ApiPlaylistSong[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState<boolean>(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the list of "Artist" type playlists when the component mounts
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoadingPlaylists(true);
      setError(null);
      try {
        // Fetch playlists specifically of type 'Artist'
        const fetchedPlaylists = await getPlaylistsByType('ARTIST');
        setPlaylists(fetchedPlaylists);
        // Optionally select the first one by default
        // if (fetchedPlaylists.length > 0) {
        //   setActivePlaylistId(fetchedPlaylists[0].id);
        // }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load "Best Of" playlists.');
        console.error("Failed to fetch artist playlists:", err);
      } finally {
        setIsLoadingPlaylists(false);
      }
    };
    fetchPlaylists();
  }, []);

  // Fetch songs for the selected playlist whenever the activePlaylistId changes
  useEffect(() => {
    if (activePlaylistId) {
      const fetchSongs = async () => {
        setIsLoadingSongs(true);
        setError(null);
        setSongs([]); // Clear previous songs
        try {
          const fetchedSongs = await getSongsByPlaylistId(activePlaylistId);
          setSongs(fetchedSongs);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load songs for the selected playlist.');
          console.error(`Failed to fetch songs for playlist ID ${activePlaylistId}:`, err);
        } finally {
          setIsLoadingSongs(false);
        }
      };
      fetchSongs();
    } else {
      setSongs([]); // Clear songs if no playlist is selected
    }
  }, [activePlaylistId]); // Re-run only when activePlaylistId changes

  // Determine content for the song list area
  let songContent;
  if (isLoadingSongs) {
    songContent = <p className="text-gray-400 text-center py-10">Loading songs...</p>;
  } else if (error && songs.length === 0) {
     songContent = <p className="text-red-500 text-center py-10">Error: {error}</p>;
  } else if (!activePlaylistId) {
       songContent = <p className="text-gray-400 text-center py-10">Select an artist's playlist above to view songs.</p>;
  } else if (songs.length === 0) {
    songContent = <p className="text-gray-400 text-center py-10">This playlist appears to be empty.</p>;
  } else {
    songContent = songs.map((song) => (
      <TrackRow key={song.id} track={song} />
    ));
  }

  return (
    <div className="flex flex-col">
      {/* Page Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white font-semibold text-left px-0 py-6 sm:py-8">
        Best Of Playlists
      </h1>

      {/* Playlist Selector Section */}
      <div className="mb-6 sm:mb-8">
        {isLoadingPlaylists ? (
          <p className="text-gray-400 px-0">Loading playlists...</p>
        ) : playlists.length > 0 ? (
          // Use a grid to display the playlist cards
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 sm:gap-4">
            {playlists.map((playlist) => (
              <PlaylistSelectorCard
                key={playlist.id}
                playlist={playlist}
                isActive={activePlaylistId === playlist.id}
                onClick={setActivePlaylistId} // Set the active playlist ID when clicked
              />
            ))}
          </div>
        ) : (
           !error && <p className="text-gray-400 px-0">No "Best Of" playlists found.</p>
        )}
        {error && playlists.length === 0 && <p className="text-red-500 px-0 mb-4">Error loading playlists: {error}</p>}
      </div>


      {/* Container for the track table (only shown if a playlist is selected) */}
      {activePlaylistId && (
         <div className="bg-[rgba(12,14,15,0.5)] rounded-lg shadow-xl overflow-hidden mt-4">
          <table className="w-full min-w-[700px]">
            <thead>
              <TrackTableHeader />
            </thead>
            <tbody>
              {songContent} {/* Render songs, loading, or error message */}
            </tbody>
          </table>
         </div>
      )}
      {/* Show message if no playlist is selected yet */}
      {!activePlaylistId && !isLoadingPlaylists && playlists.length > 0 && songContent}

    </div>
  );
};

export default BestOfPlaylistsPage;