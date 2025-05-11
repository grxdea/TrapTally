    // src/components/PlaylistSelectorCard.tsx
    import React from 'react';
    import { ApiPlaylistSummary } from '../services/playlist.service';

    interface PlaylistSelectorCardProps {
      playlist: ApiPlaylistSummary;
      isActive: boolean;
      onClick: (playlistId: string) => void;
      className?: string;
    }

    /**
     * A card component to display a playlist cover and name, used for selection.
     */
    const PlaylistSelectorCard: React.FC<PlaylistSelectorCardProps> = ({
      playlist,
      isActive,
      onClick,
      className = '',
    }) => {
      return (
        <button
          onClick={() => onClick(playlist.id)}
          className={`
            flex flex-col items-center p-3 rounded-lg transition-all duration-150 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgba(6,7,8,1)] focus:ring-gray-500
            ${isActive ? 'bg-gray-600/80 scale-105 shadow-lg' : 'bg-gray-700/60 hover:bg-gray-600/80'}
            ${className}
          `}
          aria-pressed={isActive} // For accessibility
        >
          {/* Playlist Cover Image */}
          <img
            src={playlist.coverImageUrl || 'https://placehold.co/150x150/060708/FFFFFF?text=No+Art'}
            alt={`Cover for ${playlist.name}`}
            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded mb-2 shadow"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/150x150/060708/FFFFFF?text=No+Art')}
          />
          {/* Playlist Name */}
          <span className={`
            text-xs sm:text-sm font-medium text-center truncate w-full
            ${isActive ? 'text-white' : 'text-gray-300'}
          `}>
            {playlist.name}
          </span>
        </button>
      );
    };

    export default PlaylistSelectorCard;
    