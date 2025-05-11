    // src/components/TrackTableHeader.tsx
    import React from 'react';

    /**
     * Component for displaying the header row of the track table.
     */
    const TrackTableHeader: React.FC = () => {
      return (
        // Adjusted padding and text size for consistency
        <div className="flex w-full items-center text-xs sm:text-sm text-gray-400 font-semibold uppercase tracking-wider px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-700">
          {/* Widths based on your TrackRow.txt */}
          <div className="w-[30%] text-left pl-2">Song</div>
          <div className="w-[20%] text-left">Artist</div>
          <div className="w-[20%] text-left">Album</div> {/* Added Album column */}
          <div className="w-[15%] text-center">Released</div>
          <div className="w-[15%] text-center pr-2">Year</div>
        </div>
      );
    };

    export default TrackTableHeader; // Added default export
    