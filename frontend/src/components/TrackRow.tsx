// src/components/TrackRow.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ApiPlaylistSong } from '../services/playlist.service';
import { usePlaybackStore, selectDeviceId, selectSpotifyAccessToken } from '../store/playbackStore';

interface TrackRowProps {
  track: ApiPlaylistSong;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track }) => {
  // Get token and device ID from store
  const accessToken = usePlaybackStore(selectSpotifyAccessToken);
  const deviceId = usePlaybackStore(selectDeviceId);
  const setIsPlaying = usePlaybackStore(state => state.setIsPlaying);
  const setCurrentTrackId = usePlaybackStore(state => state.setCurrentTrackId);
  
  // Play the track using Spotify API
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Play clicked for track: ${track.title} (Spotify ID: ${track.spotifyTrackId})`);
    
    if (!accessToken || !deviceId) {
      console.error('Cannot play: No access token or device ID available');
      return;
    }
    
    if (!track.spotifyTrackId) {
      console.error('Cannot play: No Spotify track ID available');
      return;
    }
    
    try {
      // Form the track URI from the ID
      const trackUri = `spotify:track:${track.spotifyTrackId}`;
      
      // Call the Spotify API to play the track
      const url = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to play track');
      }
      
      // Update the playback state
      setIsPlaying(true);
      setCurrentTrackId(track.spotifyTrackId);
    } catch (err) {
      console.error('Error playing track:', err);
    }
  };

  // Renders artist names as links
  const renderArtistLinks = () => {
    if (!track.artists || track.artists.length === 0) return <span>Unknown Artist</span>;

    return track.artists.map((artist, index) => (
      <React.Fragment key={artist.id}>
        {index > 0 && ", "}
        <Link
          to={`/artists/${artist.id}`}
          className="hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {artist.name}
        </Link>
      </React.Fragment>
    ));
  };

  // Format release month/day if available
  const formatReleaseDate = (month?: number | null): string => {
    if (month) {
      // Simple month abbreviation
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[month - 1]}`;
    }
    return 'N/A';
  };

  return (
    <tr 
      className="track-row cursor-pointer"
      onClick={handlePlayClick}
    >
      <td>
        <div className="song-cell">
          <img
            src={track.coverImageUrl || 'https://placehold.co/40x40/121212/FFFFFF?text=NA'}
            alt={track.title}
            className="album-art-small"
          />
          <span>{track.title}</span>
        </div>
      </td>
      <td>{renderArtistLinks()}</td>
      <td>{track.album?.name || 'N/A'}</td>
      <td className="text-center">{formatReleaseDate(track.releaseMonth)}</td>
      <td className="text-center">{track.releaseYear}</td>
    </tr>
  );
};

export default TrackRow;
