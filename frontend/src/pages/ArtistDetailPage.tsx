// src/pages/ArtistDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Remove unused Link import
import { getArtistById, ApiArtistDetail } from '../services/artist.service';
import TrackRow from '../components/TrackRow';

/**
 * Component for the Artist Detail page.
 * Fetches and displays details for a specific artist, including their featured songs.
 */
const ArtistDetailPage: React.FC = () => {
  // Get the artistId from the URL parameter (defined in App.tsx route)
  const { artistId } = useParams<{ artistId: string }>();

  // State for artist data, loading, and error handling
  const [artistData, setArtistData] = useState<ApiArtistDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch artist details when the component mounts or artistId changes
  useEffect(() => {
    // Ensure we have an artistId before fetching
    if (!artistId) {
      setError('No artist ID provided in the URL.');
      setIsLoading(false);
      return; // Exit if no ID
    }

    const fetchArtistDetails = async () => {
      setIsLoading(true);
      setError(null);
      setArtistData(null); // Clear previous data
      try {
        const data = await getArtistById(artistId);
        if (data) {
          setArtistData(data);
        } else {
          // Handle case where artist is not found (404 from API)
          setError(`Artist with ID "${artistId}" not found.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load artist details.');
        console.error(`Failed to fetch details for artist ID ${artistId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistDetails();
  }, [artistId]); // Re-run effect if artistId changes

  return (
    <div className="container mx-auto px-6 py-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8">
          <p>{error}</p>
        </div>
      ) : artistData ? (
        <div>
          {/* Artist Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-semibold text-white mb-4">{artistData.name}</h1>
            {artistData.bio && (
              <p className="text-white/80 max-w-3xl">{artistData.bio}</p>
            )}
          </div>

          {/* Artist Songs Section */}
          <div className="mb-12">
            <h2 className="text-xl font-medium text-white mb-6">Featured Songs</h2>
            
            {artistData.featuredSongs && artistData.featuredSongs.length > 0 ? (
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
                  {artistData.featuredSongs.map((song) => (
                    <TrackRow key={song.id} track={song} />
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-white/60">No featured songs available for this artist.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-white/60 p-8">
          <p>Artist not found</p>
        </div>
      )}
    </div>
  );
};

export default ArtistDetailPage;
