    // src/components/YearSelector.tsx
    import React from "react";

    interface YearSelectorProps {
      years: number[];
      activeYear: number | null; // Allow null if no year is selected initially
      onYearChange: (year: number) => void;
      className?: string; // Allow passing additional classes
    }

    export const YearSelector: React.FC<YearSelectorProps> = ({
      years,
      activeYear,
      onYearChange,
      className = "",
    }) => {
      // Sort years descending for display
      const sortedYears = [...years].sort((a, b) => b - a);

      return (
        // Added overflow-x-auto for horizontal scrolling on small screens
        <div className={`flex gap-2 py-4 overflow-x-auto ${className}`}>
          {sortedYears.map((year) => (
            <button
              key={year}
              // Styling adapted for consistency with FilterButtons
              className={`
                flex-shrink-0 h-9 sm:h-10 items-center justify-center
                px-4 sm:px-6 py-2 rounded-full
                text-xs sm:text-sm font-medium tracking-wide
                transition-colors duration-150 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgba(6,7,8,1)]
                ${
                  activeYear === year
                    ? "bg-gray-300 text-black focus:ring-gray-400" // Active button style
                    : "bg-gray-700/60 text-gray-300 hover:bg-gray-600/80 hover:text-white border border-gray-600 focus:ring-gray-500" // Inactive button style
                }
              `}
              onClick={() => onYearChange(year)}
            >
              {year}
            </button>
          ))}
        </div>
      );
    };

    export default YearSelector; // Added default export
    