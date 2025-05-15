// src/components/ArtistTableRow.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // For linking to artist detail page

/**
 * Interface defining the props for the ArtistTableRow component.
 */
interface ArtistTableRowProps {
  artist: {
    id: string;
    name: string;
    monthlyFeatures: number;
    yearlyFeatures: number;
    bestOfSongs: number;
    imageUrl?: string; // Optional artist image URL
  };
}

/**
 * Component to display a single artist as a row in a table.
 * Styled to match the TrackRow component styling.
 */
const ArtistTableRow: React.FC<ArtistTableRowProps> = ({ artist }) => {
  return (
    <tr className="track-row">
      <td>
        <div className="song-cell"> {/* Using song-cell class for consistent styling */}
          {/* Artist image with fallback */}
          <img
            src={artist.imageUrl || 'https://placehold.co/40x40/121212/FFFFFF?text=NA'}
            alt={artist.name}
            className="album-art-small" /* Using the same class as track images */
          />
          <Link 
            to={`/artists/${artist.id}`}
            className="hover:underline text-base"
          >
            {artist.name}
          </Link>
        </div>
      </td>
      <td className="text-center">{artist.monthlyFeatures}</td>
      <td className="text-center">{artist.yearlyFeatures}</td>
      <td className="text-center">{artist.bestOfSongs}</td>
    </tr>
  );
};

export default ArtistTableRow;