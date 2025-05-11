// src/components/ArtistsTableHeader.tsx
import React from 'react';

/**
 * Component for displaying the header row of the artists table.
 * Defines the column titles for artist information.
 */
const ArtistsTableHeader: React.FC = () => {
  return (
    // Styling inspired by your TableHeader.txt and YearlyPlaylists screenshot
    // Using Tailwind CSS classes for a dark theme table header
    <div className="flex w-full items-center text-xs sm:text-sm text-gray-400 font-semibold uppercase tracking-wider px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-700">
      {/* Artist Name column - takes up more space */}
      <div className="w-2/5 text-left pl-2">Artist</div>
      {/* Monthly Features column */}
      <div className="w-1/5 text-center">Monthly Features</div>
      {/* Yearly Features column */}
      <div className="w-1/5 text-center">Yearly Features</div>
      {/* Corrected Column Label: "Best Of Features" */}
      <div className="w-1/5 text-center pr-2">Best Of Features</div>
    </div>
  );
};

export default ArtistsTableHeader;
