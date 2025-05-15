// src/components/ArtistsTableHeader.tsx
import React from 'react';

/**
 * Component for displaying the header row of the artists table.
 * Defines the column titles for artist information.
 */
const ArtistsTableHeader: React.FC = () => {
  return (
    // Using tr/th elements for proper table structure while keeping the current styling
    <tr className="text-xs sm:text-sm text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-700">
      {/* Artist Name column - takes up more space */}
      <th className="text-left pl-2">Artist</th>
      {/* Monthly Features column */}
      <th className="text-center !text-center">Monthly Features</th>
      {/* Yearly Features column */}
      <th className="text-center !text-center">Yearly Features</th>
      {/* Best Of Features column */}
      <th className="text-center !text-center">Best Of Features</th>
    </tr>
  );
};

export default ArtistsTableHeader;
