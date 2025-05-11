    // src/components/FilterButtons.tsx
    import React from 'react';

    /**
     * Interface defining the props for the FilterButtons component.
     */
    interface FilterButtonsProps {
      filters: string[]; // Array of filter button labels
      activeFilter: string; // The currently active filter label
      onFilterChange: (filter: string) => void; // Function to call when a filter button is clicked
      className?: string; // Optional additional CSS classes for the container
    }

    /**
     * Component to display a group of filter buttons.
     * Allows users to select a filter option.
     */
    const FilterButtons: React.FC<FilterButtonsProps> = ({
      filters,
      activeFilter,
      onFilterChange,
      className = '',
    }) => {
      return (
        // Container for the filter buttons, allowing them to wrap if space is limited
        // Styling inspired by your FilterButtons.txt and YearSelector.txt
        <div className={`flex flex-wrap gap-2 sm:gap-3 ${className}`}>
          {filters.map((filter) => (
            <button
              key={filter}
              // Styling for each button, with different styles for active vs. inactive states
              className={`
                flex h-9 sm:h-10 items-center justify-center 
                px-4 sm:px-6 py-2 rounded-full 
                text-xs sm:text-sm font-medium tracking-wide
                transition-colors duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgba(6,7,8,1)]
                ${
                  activeFilter === filter
                    ? 'bg-gray-300 text-black focus:ring-gray-400' // Active button style
                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-600/80 hover:text-white border border-gray-600 focus:ring-gray-500' // Inactive button style
                }
              `}
              onClick={() => onFilterChange(filter)} // Call the onFilterChange handler when clicked
            >
              {filter}
            </button>
          ))}
        </div>
      );
    };

    export default FilterButtons;
    