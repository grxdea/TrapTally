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
        // We can add an optional artist image URL here later if needed
        // imageUrl?: string;
      };
    }

    /**
     * Component to display a single artist as a row in a table.
     * Styled for a dark theme, aligning with ArtistsTableHeader.
     */
    const ArtistTableRow: React.FC<ArtistTableRowProps> = ({ artist }) => {
      return (
        // Each row is a flex container, with hover effect and bottom border
        // Inspired by your TrackRow.txt styling
        <Link
          to={`/artists/${artist.id}`} // Link to the artist's detail page
          className="flex w-full items-center text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-150 ease-in-out px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-700 last:border-b-0"
        >
          {/* Artist Name column - aligns with w-2/5 in header */}
          {/* Added some padding for better visual separation if an image is added later */}
          <div className="w-2/5 text-left pl-2 flex items-center">
            {/* Placeholder for artist image - uncomment and use if you have images
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={artist.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full mr-3 bg-gray-600 flex-shrink-0"></div> // Placeholder circle
            )}
            */}
            <span className="font-medium truncate">{artist.name}</span>
          </div>

          {/* Monthly Features column - aligns with w-1/5 in header */}
          <div className="w-1/5 text-center">
            {artist.monthlyFeatures}
          </div>

          {/* Yearly Features column - aligns with w-1/5 in header */}
          <div className="w-1/5 text-center">
            {artist.yearlyFeatures}
          </div>

          {/* Best Of Songs column - aligns with w-1/5 in header */}
          <div className="w-1/5 text-center pr-2">
            {artist.bestOfSongs}
          </div>
        </Link>
      );
    };

    export default ArtistTableRow;
    